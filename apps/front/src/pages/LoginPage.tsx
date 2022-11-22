import { Alert, Avatar, Box, Button, Checkbox, FormControlLabel, Grid, TextField, Typography } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { RouterLink, useApi } from '@wishlist/common-front';
import { useDispatch } from 'react-redux';
import { useState } from 'react';
import { setToken } from '../core/store/features';
import { AxiosError } from 'axios';
import { wishlistApiRef } from '../core/api/wishlist.api';
import { LoginInputDto } from '@wishlist/common-types';

export const LoginPage = () => {
  const api = useApi(wishlistApiRef);
  const dispatch = useDispatch();
  const [form, setForm] = useState<LoginInputDto>({ email: '', password: '' });
  const [errors, setErrors] = useState<string[]>([]);

  async function onSubmit(e: any) {
    e.preventDefault();
    setErrors([]);
    try {
      const { data } = await api.login(form);
      dispatch(setToken(data.access_token));
    } catch (e) {
      const error = e as AxiosError;
      const data = error?.response?.data as any;
      setErrors(Array.isArray(data?.message) ? data?.message : [data?.message]);
    }
  }

  return (
    <>
      <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
        <LockOutlinedIcon />
      </Avatar>
      <Typography component="h1" variant="h5">
        Sign in
      </Typography>
      <Box component="form" onSubmit={onSubmit} noValidate sx={{ mt: 1 }}>
        {errors.length > 0 && (
          <Alert severity="error" sx={{ mt: 1, mb: 1 }} onClose={() => setErrors([])}>
            {errors.map((e, i) => (
              <div key={i}>{e}</div>
            ))}
          </Alert>
        )}
        <TextField
          margin="normal"
          type="email"
          required
          fullWidth
          id="email"
          label="Email Address"
          name="email"
          autoComplete="email"
          autoFocus
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="Password"
          type="password"
          id="password"
          autoComplete="current-password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <FormControlLabel control={<Checkbox value="remember" color="primary" />} label="Remember me" />
        <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
          Sign In
        </Button>
        <Grid container>
          <Grid item xs>
            <RouterLink to="#" variant="body2">
              Forgot password?
            </RouterLink>
          </Grid>
          <Grid item>
            <RouterLink to="/register" variant="body2">
              Don't have an account? Sign Up
            </RouterLink>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};
