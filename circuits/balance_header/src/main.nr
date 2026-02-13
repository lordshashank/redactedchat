use shared::link::{compute_link, address_to_field};
use shared::types::{Address, Bytes32};
use shared::fragment::Fragment;
use shared::rlp_decode::decode_list;
use shared::rlp_types::RlpList;
use keccak256::keccak256;
use poseidon::poseidon::bn254::hash_2;

global MAX_HEADER_RLP_LEN: u32 = 708;
global MAX_HEADER_FIELDS: u32 = 20;
global STATE_ROOT_INDEX: u32 = 3;
global BLOCK_NUM_INDEX: u32 = 8;

fn main(
    // Public inputs
    chain_id: pub u32,
    block_number: pub u64,
    commitment_in: pub Field,

    // Private inputs
    address: Address,
    nullifier_balance: u128,
    blinding: Field,
    header_rlp: [u8; MAX_HEADER_RLP_LEN],
    header_rlp_len: u32,
    header_state_root: Bytes32,
) -> pub (Bytes32, Field) {
    // 1. Verify commitment matches Circuit A
    let addr_field = address_to_field(address);
    let inner = hash_2([addr_field, nullifier_balance as Field]);
    let recomputed = hash_2([inner, blinding]);
    assert(recomputed == commitment_in, "Commitment mismatch");

    // 2. Verify block header RLP
    let header_fragment = Fragment::new_with_length(header_rlp_len, header_rlp);
    let header_fields: RlpList<MAX_HEADER_FIELDS> = decode_list(header_fragment);

    // Assert block_number matches
    header_fields.get(BLOCK_NUM_INDEX).assert_eq_value("Block number", header_fragment, block_number);
    // Assert state_root matches
    header_fields.get(STATE_ROOT_INDEX).assert_eq_value("State root", header_fragment, header_state_root);

    // 3. Hash header to get block_hash
    let block_hash: Bytes32 = keccak256(header_rlp, header_rlp_len);

    // 4. Compute address_hash = keccak256(address)
    let address_hash: Bytes32 = keccak256(address, 20);

    // 5. Compute link_out: state_root is curr_hash for first MPT step, key_ptr starts at 0
    let link_out = compute_link(header_state_root, address_hash, 0, nullifier_balance, blinding);

    (block_hash, link_out)
}
