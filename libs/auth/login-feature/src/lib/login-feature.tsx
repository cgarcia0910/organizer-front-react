import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { Alert } from '@mui/material';
import { zodResolver } from '@hookform/resolvers/zod';
import { type LoginFormValues, loginSchema } from './login.schema';
import { AuthLayout } from './components/AuthLayout';

export function LoginFeature() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const {
    handleSubmit,
    setError,
    clearErrors,
    register,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    defaultValues: { email: '', password: '' },
    resolver: zodResolver(loginSchema),
  });

  const { ref: emailRef, ...emailField } = register('email');
  const { ref: passwordRef, ...passwordField } = register('password');

  const onSubmit: SubmitHandler<LoginFormValues> = async (data) => {
    clearErrors('root.serverError');
    try {
      const loginResult = await login(data.email, data.password);
      switch (loginResult.status) {
        case 'success':
          navigate('/', { replace: true });
          return;
        case 'invalid-credentials':
          setError('root.serverError', {
            type: 'server',
            message: 'Invalid email or password',
          });
          return;
        case 'server-error':
          setError('root.serverError', {
            type: 'server',
            message: 'Something went wrong, try again later',
          });
          return;
      }
    } catch {
      setError('root.serverError', {
        type: 'network',
        message: 'Could not reach the server',
      });
    }
  };

  return (
    <AuthLayout>
      <Typography
        component="h1"
        variant="h4"
        sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
      >
        Sign in
      </Typography>
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 2 }}
      >
        {errors.root?.serverError && (
          <Alert severity="error">{errors.root.serverError.message}</Alert>
        )}
        <TextField
          {...emailField}
          inputRef={emailRef}
          id="email"
          label="Email"
          type="email"
          placeholder="your@email.com"
          autoComplete="email"
          autoFocus
          fullWidth
          variant="outlined"
          error={!!errors.email}
          helperText={errors.email?.message}
        />
        <TextField
          {...passwordField}
          inputRef={passwordRef}
          id="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          fullWidth
          variant="outlined"
          error={!!errors.password}
          helperText={errors.password?.message}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={isSubmitting}
          startIcon={
            isSubmitting ? <CircularProgress size={20} color="inherit" /> : null
          }
        >
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </Button>
      </Box>
    </AuthLayout>
  );
}

export default LoginFeature;
