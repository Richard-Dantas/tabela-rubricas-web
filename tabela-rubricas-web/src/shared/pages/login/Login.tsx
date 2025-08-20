import { useState } from 'react';
import { Avatar, Box, Button, Checkbox, CircularProgress, CssBaseline, FormControlLabel, Grid, Link, Paper, TextField, Typography } from '@mui/material';
import * as yup from 'yup';
import { useAuthContext } from '../../contexts';
import { Copyright } from '@mui/icons-material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useNavigate } from 'react-router-dom';


const loginSchema = yup.object().shape({
  email: yup.string().email().required(),
  password: yup.string().required().min(5),
});

interface ILoginProps {
  children: React.ReactNode;
}
export const Login: React.FC<ILoginProps> = ({ children }) => {
  const { isAuthenticated, login } = useAuthContext();

  const [isLoading, setIsLoading] = useState(false);

  const [passwordError, setPasswordError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [loginError, setLoginError] = useState('');
  const navigate = useNavigate();


  const handleSubmit = () => {
    setIsLoading(true);
    setLoginError('');

    loginSchema
    .validate({ email, password }, { abortEarly: false })
    .then(async dadosValidados => {
      const result = await login(dadosValidados.email, dadosValidados.password);

      if (result) {
        // Se houver mensagem de erro do backend
        setLoginError(result);
      } else {
        // Login bem-sucedido
        navigate('/rubricas');
      }

      setIsLoading(false);
    })
    .catch((errors: yup.ValidationError) => {
      setIsLoading(false);

      errors.inner.forEach(error => {
        if (error.path === 'email') {
          setEmailError(error.message);
        } else if (error.path === 'password') {
          setPasswordError(error.message);
        }
      });
    });
  };


  if (isAuthenticated) return (
    <>{children}</>
  );

  return (
    <Grid container component="main" sx={{
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}>       
        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Entrar
            </Typography>
            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email"
                name="email"
                autoComplete="email"
                autoFocus
                disabled={isLoading}
                error={!!emailError}
                helperText={emailError}
                onKeyDown={() => setEmailError('')}
                onChange={e => setEmail(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Senha"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                disabled={isLoading}
                error={!!passwordError}
                helperText={passwordError}
                onKeyDown={() => setPasswordError('')}
                onChange={e => setPassword(e.target.value)}
              />
              {loginError && (
  <Typography color="error" variant="body2" align="center">
    {loginError}
  </Typography>
)}
              <FormControlLabel
                control={<Checkbox value="remember" color="primary" />}
                label="Lembrar"
              />
              <Button

                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={isLoading}
                onClick={handleSubmit}
                endIcon={isLoading ? <CircularProgress variant='indeterminate' color='inherit' size={20} /> : undefined}
              >
                Entrar
              </Button>
              <Grid container>
                <Grid item xs>
                  <Link href="#" variant="body2">
                    Esqueceu sua senha?
                  </Link>
                </Grid>
              </Grid>
              <Copyright sx={{ mt: 5 }} />
            </Box>
          </Box>
        </Grid>
      </Grid>
  );
};