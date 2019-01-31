import React from 'react'
import { View } from 'react-native'
import { Form, Item, Input, Label, Button, Text } from 'native-base'
import { translate } from 'react-i18next'
import validate from 'validate.js'
import { PhoneNumberUtil } from 'google-libphonenumber'
import _ from 'lodash'
import i18n from '../i18n'

const phoneUtil = PhoneNumberUtil.getInstance()

// Custom validator for phone numbers
// `parseAndKeepRawInput` throws exceptions if it receives an un-parseable input
// (including a phone number without a country-code)
validate.validators.phoneNumber = (value, options, key, attributes) => {
  let number = ''

  try {
    return phoneUtil.isValidNumber(phoneUtil.parseAndKeepRawInput(value))
      ? null
      : options.message

  } catch (error) {
    return options.message

  }
}

// Custom validator for matches
// Checks whether the given value matches another value in the object under validation
// Used for password confirmation checks
validate.validators.matches = (value, options, key, attributes) =>
  value === attributes[options.key]
    ? null
    : options.message

const inputs = [
  {
    name: 'email',
    label: i18n.t('EMAIL'),
    props: {
      keyboardType: 'email-address',
    },
    constraints: {
      presence: { message: i18n.t('INVALID_EMAIL') },
      email: {
        message: i18n.t('INVALID_EMAIL'),
      },
    }
  },
  {
    name: 'username',
    label: i18n.t('USERNAME'),
    constraints: {
      presence: { message: i18n.t('INVALID_USERNAME') },
      length: {
        minimum: 2,
        message: i18n.t('INVALID_USERNAME'),
      },
    }
  },
  {
    name: 'password',
    label: i18n.t('PASSWORD'),
    props: {
      secureTextEntry: true,
    },
    constraints: {
      presence: { message: i18n.t('INVALID_PASSWORD') },
      length: {
        minimum: 8,
        message: i18n.t('INVALID_PASSWORD'),
      },
    }
  },
  {
    name: 'passwordConfirmation',
    label: i18n.t('CONFIRM_PASSWORD'),
    props: {
      secureTextEntry: true,
    },
    constraints: {
      presence: { message: i18n.t('INVALID_PASSWORD_CONFIRMATION') },
      matches: {
        key: 'password',
        message: i18n.t('INVALID_PASSWORD_CONFIRMATION'),
      }
    }
  },
  {
    name: 'givenName',
    label: i18n.t('GIVEN_NAME'),
    constraints: {
      presence: { message: i18n.t('INVALID_GIVEN_NAME') },
      length: {
        minimum: 1,
        message: i18n.t('INVALID_GIVEN_NAME'),
      }
    }
  },
  {
    name: 'familyName',
    label: i18n.t('FAMILY_NAME'),
    constraints: {
      presence: { message: i18n.t('INVALID_FAMILY_NAME') },
      length: {
        minimum: 1,
        message: i18n.t('INVALID_FAMILY_NAME'),
      }
    }
  },
  {
    name: 'telephone',
    label: i18n.t('PHONE_NUMBER'),
    props: {
      keyboardType: 'phone-pad',
    },
    constraints: {
      presence: { message: i18n.t('INVALID_PHONE_NUMBER') },
      phoneNumber: {
        message: i18n.t('INVALID_PHONE_NUMBER'),
      },
    }
  }
]

const constraints = _.reduce(
  inputs,
  (acc, { name, constraints }) => ({ ...acc, [name]: constraints }),
  {}
)

class RegisterForm extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      givenName: '',
      familyName: '',
      email: '',
      telephone: '',
      username: '',
      password: '',
      passwordConfirmation: '',
      error: false,
    }
  }

  onSubmit() {
    this.setState({ message: '' })

    const { error, ...data } = this.state
    const { client, onRequestStart, onRequestEnd, onRegisterSuccess, onRegisterFail } = this.props

    const validationErrors = validate(data, constraints, { fullMessages: false })

    if (validationErrors) {
      this.setState({ error: true })
      return onRegisterFail(Object.values(validationErrors)[0])
    }

    onRequestStart()
    client.register(data)
      .then(user => {
        onRequestEnd()
        onRegisterSuccess(user)
      })
      .catch(err => {
        onRequestEnd()

        if (err.status && err.status === 400) {
          this.setState({ error: true });
          onRegisterFail(this.props.t('EMAIL_ALREADY_REGISTERED'));

        } else {
          onRegisterFail(this.props.t('TRY_LATER'))
        }
      })
  }

  render() {

    return (
      <View>
        <Form>
          { inputs.map(input => (
            <Item key={ input.name } stackedLabel>
              <Label>{ input.label }</Label>
              <Input
                autoCorrect={ false }
                autoCapitalize="none"
                style={{ height: 40 }}
                onChangeText={ value => this.setState({ [input.name]: value }) }
                { ...input.props }
              />
            </Item>
          )) }
        </Form>
        <View style={{ marginTop: 20 }}>
          <Button block onPress={() => this.onSubmit()}>
            <Text>{this.props.t('SUBMIT')}</Text>
          </Button>
        </View>
      </View>
    )
  }
}

export default translate()(RegisterForm)
