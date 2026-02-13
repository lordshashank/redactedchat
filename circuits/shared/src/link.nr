use poseidon::poseidon::bn254::hash_2;

// Convert 16 bytes from a byte array starting at `start` into a Field element
pub fn bytes16_to_field(arr: [u8; 32], start: u32) -> Field {
    let mut result: Field = 0;
    for i in 0..16 {
        result = result * 256 + arr[start + i] as Field;
    }
    result
}

// Convert a 20-byte address into a Field element
pub fn address_to_field(address: [u8; 20]) -> Field {
    let mut result: Field = 0;
    for i in 0..20 {
        result = result * 256 + address[i] as Field;
    }
    result
}

// Compute a privacy-preserving link commitment between sub-circuits.
// The blinding factor prevents brute-force attacks on the intermediate state.
pub fn compute_link(
    curr_hash: [u8; 32],
    address_hash: [u8; 32],
    key_ptr: u32,
    nullifier_balance: u128,
    blinding: Field,
) -> Field {
    let ch_hi = bytes16_to_field(curr_hash, 0);
    let ch_lo = bytes16_to_field(curr_hash, 16);
    let ah_hi = bytes16_to_field(address_hash, 0);
    let ah_lo = bytes16_to_field(address_hash, 16);
    let h1 = hash_2([ch_hi, ch_lo]);
    let h2 = hash_2([ah_hi, ah_lo]);
    let h3 = hash_2([key_ptr as Field, nullifier_balance as Field]);
    hash_2([hash_2([h1, h2]), hash_2([h3, blinding])])
}
