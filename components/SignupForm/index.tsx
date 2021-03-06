import { useForm, useField } from 'react-final-form-hooks'
import React, { useState, useEffect } from 'react'
import * as Utils from 'web3-utils'
import ReCAPTCHA from 'react-google-recaptcha'
import Button from '@material-ui/core/Button'
import EmailValidator from 'email-validator'
import FormControl from '@material-ui/core/FormControl'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormLabel from '@material-ui/core/FormLabel'
import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import styled from '@emotion/styled'
import TextField from '@material-ui/core/TextField'
import axios from 'axios'
import Modal from '@material-ui/core/Modal'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'
import CloseIcon from '@material-ui/icons/Close'
import { Container } from '../../lib/helpers'
import { mq } from '../../lib/helpers'
import {
  Background,
  Form,
  Wrapper,
  Column,
  Heading,
  Subheading,
  Body,
  ButtonContainer,
  Label,
} from './styles'

const StyledPaper: any = styled(Paper)({
  width: 'calc(100% - 40px)',
  outline: 'none',
  padding: '32px 24px',
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  [mq[2]]: {
    width: 'inherit',
    maxWidth: 600,
  },
})

const StyledRadioGroup: any = styled(RadioGroup)({
  '&&': {
    display: 'flex',
    flexDirection: 'row',
  },
})

const recaptchaRef: any = React.createRef()

const onSubmit = async (values: any) => {
  try {
    recaptchaRef.current.execute()
    await axios.post('/confirmEmail', {
      email: values.email,
      delegatorAddress: values.delegatorAddress.toLowerCase(),
      frequency: values.frequency,
      senderEmail: values.senderEmail,
      senderName: values.senderName,
    })
  } catch (e) {
    console.log(e)
  }
}

const validate = (values: any) => {
  const errors: any = {}
  if (!values.email) {
    errors.email = 'Required'
  } else if (!EmailValidator.validate(values.email)) {
    errors.email = 'Invalid email address'
  }
  if (!values.delegatorAddress) {
    errors.delegatorAddress = 'Required'
  } else if (!Utils.isAddress(values.delegatorAddress)) {
    errors.delegatorAddress = 'Invalid Ethereum Address'
  }
  return errors
}

export default ({ account }) => {
  let [open, setOpen] = useState(false)
  let { form, handleSubmit, submitting, submitSucceeded } = useForm({
    onSubmit,
    validate,
    initialValues: {
      frequency: 'weekly',
      senderEmail: 'no-reply@livepeer.studio',
      senderName: 'Livepeer Studio',
      delegatorAddress: account ? account : '',
    },
  })

  let email = useField('email', form)
  let delegatorAddress = useField('delegatorAddress', form)
  let frequency = useField('frequency', form)
  let senderEmail = useField('senderEmail', form)
  let senderName = useField('senderName', form)

  useEffect(() => {
    if (submitSucceeded) {
      setOpen(true)
      form.reset()
    }
  }, [submitSucceeded])

  return (
    <Background>
      <Modal
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        open={open}
        onClose={() => setOpen(false)}>
        <StyledPaper elevation={5}>
          <CloseIcon
            onClick={() => setOpen(false)}
            style={{
              cursor: 'pointer',
              position: 'absolute',
              right: 16,
              top: 16,
            }}
          />
          <Typography
            style={{ fontFamily: 'Poppins', fontWeight: 600, marginBottom: 24 }}
            variant="h5"
            id="modal-title">
            Verify Your Email
          </Typography>
          <Typography variant="subtitle1" id="modal-description">
            A verification email has been sent to your email address. Please
            confirm it to complete the process.
          </Typography>
        </StyledPaper>
      </Modal>
      <Container>
        <Wrapper>
          <Column>
            <Heading>✧･ﾟ Staking Alerts ･ﾟ✧</Heading>
            <Subheading>Get Notified</Subheading>
            <Body>
              Sign up to receive email alerts with your earnings and keep tabs
              on how your transcoder is performing.
            </Body>
          </Column>
          <Column>
            <Form noValidate onSubmit={handleSubmit}>
              <input type="hidden" {...senderEmail.input} />
              <input type="hidden" {...senderName.input} />
              <TextField
                {...email.input}
                id="email"
                required
                label="My email address is"
                name="email"
                type="email"
                helperText={email.meta.touched && email.meta.error}
                error={!!(email.meta.touched && email.meta.error)}
                placeholder="email"
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
              />
              <TextField
                {...delegatorAddress.input}
                id="address"
                required
                type="text"
                inputProps={{
                  readOnly: !!account,
                  disabled: !!account,
                }}
                disabled={!!account}
                value={account ? account : delegatorAddress.input.value}
                helperText={
                  !account &&
                  delegatorAddress.meta.touched &&
                  delegatorAddress.meta.error
                }
                error={
                  !!(
                    !account &&
                    delegatorAddress.meta.touched &&
                    delegatorAddress.meta.error
                  )
                }
                label="My Ethereum address is"
                name="delegatorAddress"
                placeholder="e.g. 0x4bbeEB066eD09..."
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
              />
              <FormControl>
                <FormLabel>Email me</FormLabel>
                <StyledRadioGroup
                  defaultValue="weekly"
                  aria-label="Frequency"
                  onChange={e => frequency.input.onChange(e.target.value)}
                  name="frequency">
                  <FormControlLabel
                    value="weekly"
                    id="weekly"
                    control={<Radio />}
                    label="Weekly"
                  />
                  <FormControlLabel
                    value="monthly"
                    id="monthly"
                    control={<Radio />}
                    label="Monthly"
                  />
                </StyledRadioGroup>
              </FormControl>
              <ReCAPTCHA
                ref={recaptchaRef}
                size="invisible"
                sitekey="6LeEfJMUAAAAADy6m3uGNTW0go3Qvp6zDQyuCr-X"
              />
              <ButtonContainer>
                <Button
                  disabled={submitting}
                  type="submit"
                  variant="contained"
                  color="primary">
                  SIGN UP
                </Button>
                <Label>One click unsubscription in email.</Label>
              </ButtonContainer>
            </Form>
          </Column>
        </Wrapper>
      </Container>
    </Background>
  )
}
