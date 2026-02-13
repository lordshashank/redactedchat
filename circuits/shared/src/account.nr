use crate::bytes::right_pad;
use crate::fragment::Fragment;
use crate::rlp_decode::decode_list_of_small_strings;
use crate::rlp_types::RlpList;
use crate::consts::MAX_ACCOUNT_STATE_LEN;
use crate::types::Bytes32;

pub global ACCOUNT_FIELDS_COUNT: u32 = 4;
pub global NONCE_INDEX: u32 = 0;
pub global BALANCE_INDEX: u32 = 1;
pub global STORAGE_ROOT_INDEX: u32 = 2;
pub global CODE_HASH_INDEX: u32 = 3;

pub fn assert_account_equals(
    account_rlp_left_padded: [u8; MAX_ACCOUNT_STATE_LEN],
    account_nonce: u64,
    account_balance: Field,
    account_storage_root: Bytes32,
    account_code_hash: Bytes32,
) {
    let account_rlp_right_padded = right_pad(account_rlp_left_padded).storage();
    let account_rlp_list: RlpList<ACCOUNT_FIELDS_COUNT> =
        decode_list_of_small_strings(Fragment::from_array(account_rlp_right_padded));
    assert(
        account_rlp_list.len() == ACCOUNT_FIELDS_COUNT,
        "Invalid number of fields in account RLP",
    );

    let account_rlp = Fragment::from_array(account_rlp_right_padded);
    account_rlp_list.get(NONCE_INDEX).assert_eq_value("Nonce", account_rlp, account_nonce);
    account_rlp_list.get(BALANCE_INDEX).assert_eq_value(
        "Balance",
        account_rlp,
        account_balance as u128,
    );

    account_rlp_list.get(STORAGE_ROOT_INDEX).assert_eq_value(
        "Storage root",
        account_rlp,
        account_storage_root,
    );
    account_rlp_list.get(CODE_HASH_INDEX).assert_eq_value(
        "Code hash",
        account_rlp,
        account_code_hash,
    );
}
