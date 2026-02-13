// Replays the MPT path in JavaScript to compute intermediate curr_hash and key_ptr
// values needed between sub-circuit boundaries (B1->B2, B2->B3, B3->B4).

import { keccak256, toHex, hexToBytes } from 'viem';

/**
 * Expand a 32-byte address hash into key nibbles matching the circuit's
 * behavior: left-pad to 66 bytes, then right_pad (strip leading zeros),
 * then convert to nibbles.
 *
 * @param {Uint8Array} addressHash - 32-byte keccak256(address)
 * @returns {number[]} nibbles starting from first non-zero byte
 */
export function addressHashToKeyNibbles(addressHash) {
  // Build the 66-byte left-padded key (matching circuit's MAX_PREFIXED_KEY_NIBBLE_LEN)
  const keyBytes = new Uint8Array(66);
  for (let i = 0; i < 32; i++) {
    keyBytes[34 + i] = addressHash[i];
  }

  // right_pad: find first non-zero byte (matches circuit's byte_value behavior)
  let firstNonZero = 66;
  for (let i = 0; i < 66; i++) {
    if (keyBytes[i] !== 0) {
      firstNonZero = i;
      break;
    }
  }
  const significantBytes = keyBytes.slice(firstNonZero);

  // Convert to nibbles
  const nibbles = [];
  for (const b of significantBytes) {
    nibbles.push((b >> 4) & 0x0f);
    nibbles.push(b & 0x0f);
  }
  return nibbles;
}

/**
 * Parse RLP header from a byte array (simplified version for MPT nodes).
 * Returns { offset, length, type } where type is 'string' or 'list'.
 */
function decodeRlpHeader(data, pos) {
  const prefix = data[pos];
  if (prefix < 0x80) {
    return { offset: 0, length: 1, type: 'string' };
  } else if (prefix < 0xb8) {
    return { offset: 1, length: prefix - 0x80, type: 'string' };
  } else if (prefix < 0xc0) {
    const lenLen = prefix - 0xb7;
    let length = 0;
    for (let i = 0; i < lenLen; i++) {
      length = length * 256 + data[pos + 1 + i];
    }
    return { offset: 1 + lenLen, length, type: 'string' };
  } else if (prefix < 0xf8) {
    return { offset: 1, length: prefix - 0xc0, type: 'list' };
  } else {
    const lenLen = prefix - 0xf7;
    let length = 0;
    for (let i = 0; i < lenLen; i++) {
      length = length * 256 + data[pos + 1 + i];
    }
    return { offset: 1 + lenLen, length, type: 'list' };
  }
}

/**
 * Parse an RLP list of small strings (for branch/extension nodes).
 * Returns array of { offset, length } (byte positions within the node).
 */
function decodeSmallStringList(data) {
  const header = decodeRlpHeader(data, 0);
  if (header.type !== 'list') throw new Error('Expected RLP list');

  const totalLen = header.offset + header.length;
  const items = [];
  let pos = header.offset;

  while (pos < totalLen) {
    const b = data[pos];
    if (b < 0x80) {
      items.push({ offset: pos, length: 1 });
      pos += 1;
    } else if (b < 0xb8) {
      const len = b - 0x80;
      items.push({ offset: pos + 1, length: len });
      pos += 1 + len;
    } else {
      throw new Error(`Unexpected RLP prefix ${b} in small string list`);
    }
  }
  return items;
}

/**
 * Get the RLP-encoded length of a node (for keccak hashing).
 */
function getNodeLen(node) {
  const header = decodeRlpHeader(node, 0);
  return header.offset + header.length;
}

/**
 * Convert a nibble prefix to its parity.
 */
function prefixParity(prefix) {
  return prefix % 2;
}

/**
 * Extract next hash and updated key pointer from a branch or extension node.
 *
 * @param {Uint8Array} node - The RLP-encoded MPT node
 * @param {number[]} keyNibbles - The full key in nibbles
 * @param {number} keyPtr - Current position in the key
 * @returns {{ nextHash: Uint8Array, newKeyPtr: number }}
 */
function extractNextFromNode(node, keyNibbles, keyPtr) {
  const items = decodeSmallStringList(node);

  if (items.length === 17) {
    // Branch node: follow the nibble at keyPtr
    const nibble = keyNibbles[keyPtr];
    const item = items[nibble];
    if (item.length !== 32) {
      throw new Error(`Expected 32-byte hash at branch position ${nibble}, got ${item.length}`);
    }
    const nextHash = node.slice(item.offset, item.offset + 32);
    return { nextHash, newKeyPtr: keyPtr + 1 };
  } else if (items.length === 2) {
    // Extension node: strip prefix and advance key pointer
    const prefixedKeyBytes = node.slice(items[0].offset, items[0].offset + items[0].length);
    // Convert to nibbles
    const prefixedNibbles = [];
    for (const b of prefixedKeyBytes) {
      prefixedNibbles.push((b >> 4) & 0x0f);
      prefixedNibbles.push(b & 0x0f);
    }
    // Strip prefix
    const prefix = prefixedNibbles[0];
    const par = prefixParity(prefix);
    let extensionNibbles;
    if (par === 0) {
      // Even: skip 2 nibbles (prefix + 0)
      extensionNibbles = prefixedNibbles.slice(2);
    } else {
      // Odd: skip 1 nibble (prefix)
      extensionNibbles = prefixedNibbles.slice(1);
    }

    const item = items[1];
    if (item.length !== 32) {
      throw new Error(`Expected 32-byte hash at extension value, got ${item.length}`);
    }
    const nextHash = node.slice(item.offset, item.offset + 32);
    return { nextHash, newKeyPtr: keyPtr + extensionNibbles.length };
  } else {
    throw new Error(`Invalid node type with ${items.length} items`);
  }
}

/**
 * Replay the MPT path from stateRoot through a range of internal nodes.
 * Used to compute intermediate state between sub-circuits.
 *
 * @param {Uint8Array} stateRoot - 32-byte state root (starting hash)
 * @param {Uint8Array} addressHash - 32-byte keccak256(address)
 * @param {Uint8Array[]} allInternalNodes - All internal MPT proof nodes (not including leaf)
 * @param {number} fromIdx - Start processing from this index (inclusive)
 * @param {number} toIdx - Stop processing at this index (exclusive)
 * @returns {{ currHash: Uint8Array, keyPtr: number }}
 */
export function replayMptPath(stateRoot, addressHash, allInternalNodes, fromIdx, toIdx) {
  const keyNibbles = addressHashToKeyNibbles(addressHash);

  let currHash = new Uint8Array(stateRoot);
  let keyPtr = 0;

  for (let i = 0; i < toIdx && i < allInternalNodes.length; i++) {
    const node = allInternalNodes[i];

    // Verify hash (optional sanity check)
    const nodeLen = getNodeLen(node);
    const nodeSlice = node.slice(0, nodeLen);
    const nodeHashHex = keccak256(toHex(nodeSlice));
    const nodeHash = hexToBytes(nodeHashHex);
    const hashMatch = currHash.every((b, j) => b === nodeHash[j]);
    if (!hashMatch) {
      throw new Error(`Node hash mismatch at index ${i}`);
    }

    const { nextHash, newKeyPtr } = extractNextFromNode(node, keyNibbles, keyPtr);
    currHash = new Uint8Array(nextHash);
    keyPtr = newKeyPtr;
  }

  return { currHash, keyPtr };
}

/**
 * Pad a node to MAX_NODE_LEN (532) bytes with trailing zeros.
 */
export function padNode(node, maxLen = 532) {
  const padded = new Uint8Array(maxLen);
  padded.set(node.slice(0, Math.min(node.length, maxLen)));
  return padded;
}

/**
 * Left-pad a byte array to a target length with zeros.
 */
export function leftPad(bytes, targetLen) {
  if (bytes.length >= targetLen) return bytes;
  const padded = new Uint8Array(targetLen);
  padded.set(bytes, targetLen - bytes.length);
  return padded;
}

/**
 * Pad a leaf to MAX_ACCOUNT_LEAF_LEN (148) bytes with trailing zeros.
 */
export function padLeaf(leaf, maxLen = 148) {
  const padded = new Uint8Array(maxLen);
  padded.set(leaf.slice(0, Math.min(leaf.length, maxLen)));
  return padded;
}
