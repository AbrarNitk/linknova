// @generated automatically by Diesel CLI.

diesel::table! {
    linknova_bookmark (id) {
        id -> Int8,
        created_on -> Timestamptz,
        updated_on -> Timestamptz,
        title -> Text,
        url -> Text,
        content -> Nullable<Text>,
        img_url -> Text,
        user -> Text,
        tags -> Array<Nullable<Int4>>,
        is_active -> Bool,
        modified -> Bool,
        archived -> Bool,
        directory_id -> Int8,
    }
}

diesel::table! {
    linknova_directory (id) {
        id -> Int8,
        created_on -> Timestamptz,
        updated_on -> Timestamptz,
        name -> Text,
        title -> Nullable<Text>,
        about -> Nullable<Text>,
        user -> Text,
        tags -> Array<Nullable<Int4>>,
        is_active -> Bool,
        public -> Bool,
    }
}

diesel::table! {
    linknova_tags (id) {
        id -> Int8,
        created_on -> Timestamptz,
        updated_on -> Timestamptz,
        name -> Text,
        description -> Text,
        is_active -> Bool,
    }
}

diesel::joinable!(linknova_bookmark -> linknova_directory (directory_id));

diesel::allow_tables_to_appear_in_same_query!(linknova_bookmark, linknova_directory, linknova_tags,);
