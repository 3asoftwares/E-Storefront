// Address Queries
export const GET_MY_ADDRESSES_QUERY = `
  query GetMyAddresses {
    myAddresses {
      addresses {
        id
        userId
        name
        mobile
        email
        street
        city
        state
        zip
        country
        isDefault
        label
        createdAt
        updatedAt
      }
    }
  }
`;

// Address Mutations
export const ADD_ADDRESS_MUTATION = `
  mutation AddAddress($input: AddAddressInput!) {
    addAddress(input: $input) {
      success
      message
      address {
        id
        userId
        name
        mobile
        email
        street
        city
        state
        zip
        country
        isDefault
        label
        createdAt
        updatedAt
      }
    }
  }
`;

export const UPDATE_ADDRESS_MUTATION = `
  mutation UpdateAddress($id: ID!, $input: UpdateAddressInput!) {
    updateAddress(id: $id, input: $input) {
      success
      message
      address {
        id
        userId
        name
        mobile
        email
        street
        city
        state
        zip
        country
        isDefault
        label
        createdAt
        updatedAt
      }
    }
  }
`;

export const DELETE_ADDRESS_MUTATION = `
  mutation DeleteAddress($id: ID!) {
    deleteAddress(id: $id) {
      success
      message
    }
  }
`;

export const SET_DEFAULT_ADDRESS_MUTATION = `
  mutation SetDefaultAddress($id: ID!) {
    setDefaultAddress(id: $id) {
      success
      message
      address {
        id
        userId
        name
        mobile
        email
        street
        city
        state
        zip
        country
        isDefault
        label
        createdAt
        updatedAt
      }
    }
  }
`;
