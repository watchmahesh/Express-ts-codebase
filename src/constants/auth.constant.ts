export const errorAuth = {
  login: {
    authProvider: {
      notFound: 'Please specify a valid authentication provider.'
    },
    alreadyExist: {
      //given credentials not exist
      detail: {
        msg: 'User with given email or phone already exists',
        status: 401
      }
    }
  }
}

export const successAuth = {
  login: {
    msg: 'Loggedin successfully.',
    status: 200
  },
  register: {
    msg: 'Registration completed.',
    status: 200
  }
}

export const tokenError = {
  invalid: {
    msg: 'Invalid token type',
    status: 401
  },
  notFound: {
    msg: 'Signed user not found. Please login again.',
    status: 401
  }
}

export const accountStatusError = {
  invalid: {
    msg: 'Please activate your account to continue',
    status: 401
  }
}

export const keyError = {
  invalid: {
    msg: 'Invalid keypair',
    status: 401
  },
  notFound: {
    msg: 'Api Key not found',
    status: 401
  }
}

export const passwordError = {
  notStrongEnough: {
    msg: 'Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character',
    status: 401
  }
}
