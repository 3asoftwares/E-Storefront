export const GET_USERS_QUERY = `
  query GetUsers($page: Int, $limit: Int, $search: String, $role: String) {
    users(page: $page, limit: $limit, search: $search, role: $role) {
      users {
        id
        name
        email
        role
        isActive
        emailVerified
        createdAt
        lastLogin
      }
      pagination {
        page
        limit
        total
        pages
        sellerCount
        adminCount
        customerCount
      }
    }
  }
`;

export const GET_USER_QUERY = `
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      name
      email
      role
      isActive
      emailVerified
      createdAt
      lastLogin
    }
  }
`;

export const GET_USER_BY_ID_QUERY = `
  query GetUserById($id: ID!) {
    getUserById(id: $id) {
      user {
        id
        name
        email
        role
        isActive
        emailVerified
        createdAt
        lastLogin
      }
      accessToken
      refreshToken
      tokenExpiry
    }
  }
`;

export const GET_ME_QUERY = `
  query GetMe {
    me {
      id
      name
      email
      role
      isActive
      emailVerified
      createdAt
      lastLogin
    }
  }
`;

export const LOGIN_MUTATION = `
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      user {
        id
        name
        email
        role
        isActive
        emailVerified
        createdAt
      }
      accessToken
      refreshToken
    }
  }
`;

export const REGISTER_MUTATION = `
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      user {
        id
        name
        email
        role
        isActive
        emailVerified
        createdAt
      }
      accessToken
      refreshToken
    }
  }
`;

export const GOOGLE_AUTH_MUTATION = `
  mutation GoogleAuth($input: GoogleAuthInput!) {
    googleAuth(input: $input) {
      user {
        id
        name
        email
        role
        isActive
        emailVerified
        createdAt
        profilePicture
      }
      accessToken
      refreshToken
    }
  }
`;

export const LOGOUT_MUTATION = `
  mutation Logout {
    logout
  }
`;

export const UPDATE_USER_ROLE_MUTATION = `
  mutation UpdateUserRole($id: ID!, $role: String!) {
    updateUserRole(id: $id, role: $role) {
      id
      name
      email
      role
      isActive
      emailVerified
      createdAt
      lastLogin
    }
  }
`;

export const DELETE_USER_MUTATION = `
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id)
  }
`;

export const SEND_VERIFICATION_EMAIL_MUTATION = `
  mutation SendVerificationEmail($source: String) {
    sendVerificationEmail(source: $source) {
      success
      message
    }
  }
`;

export const VERIFY_EMAIL_MUTATION = `
  mutation VerifyEmail {
    verifyEmail {
      success
      message
      user {
        id
        name
        email
        role
        isActive
        emailVerified
        createdAt
      }
    }
  }
`;

export const FORGOT_PASSWORD_MUTATION = `
  mutation ForgotPassword($email: String!, $role: String!) {
    forgotPassword(email: $email, role: $role) {
      success
      message
      resetToken
      resetUrl
    }
  }
`;

export const RESET_PASSWORD_MUTATION = `
  mutation ResetPassword($token: String!, $password: String!, $confirmPassword: String!) {
    resetPassword(token: $token, password: $password, confirmPassword: $confirmPassword) {
      success
      message
    }
  }
`;

export const VALIDATE_EMAIL_TOKEN_QUERY = `
  query ValidateEmailToken($token: String!) {
    validateEmailToken(token: $token) {
      success
      message
      email
    }
  }
`;

export const VERIFY_EMAIL_BY_TOKEN_MUTATION = `
  mutation VerifyEmailByToken($token: String!) {
    verifyEmailByToken(token: $token) {
      success
      message
      user {
        id
        name
        email
        role
        isActive
        emailVerified
        createdAt
      }
    }
  }
`;

export const VALIDATE_RESET_TOKEN_QUERY = `
  query ValidateResetToken($token: String!) {
    validateResetToken(token: $token) {
      success
      message
      email
    }
  }
`;

export const UPDATE_PROFILE_MUTATION = `
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      success
      message
      user {
        id
        name
        email
        role
        isActive
        emailVerified
        createdAt
      }
    }
  }
`;
