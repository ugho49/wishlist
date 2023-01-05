import axios, { AxiosInstance } from 'axios';
import { createApiRef } from '@wishlist/common-front';
import { environment } from '../../environments/environment';
import { WishlistApi } from '../../@types/api.type';

export const wishlistApiRef = createApiRef<WishlistApi>({
  id: 'wishlist-api',
});

function getNewInstance(): AxiosInstance {
  return axios.create({
    baseURL: environment.baseUrl,
    timeout: 10_000, // 10 seconds
  });
}

export function buildApi(): WishlistApi {
  const client = getNewInstance();

  function setAuthorizationHeader(value: string) {
    client.defaults.headers.common['Authorization'] = value;
  }

  function removeAuthorizationHeader() {
    delete client.defaults.headers.common['Authorization'];
  }

  return {
    axios: {
      setAuthorizationHeader,
      removeAuthorizationHeader,
      getNewInstance,
    },
    auth: {
      login: (data) => client.post(`/auth/login`, data).then((res) => res.data),
      loginWithGoogle: (data) => client.post(`/auth/login/google`, data).then((res) => res.data),
      refreshToken: (data) => client.post(`/auth/refresh`, data).then((res) => res.data),
    },
    user: {
      getInfo: () => client.get(`/user`).then((res) => res.data),
      register: (data) => client.post(`/user/register`, data).then((res) => res.data),
      registerWithGoogle: (data) => client.post(`/user/register/google`, data).then((res) => res.data),
      update: (data) => client.put(`/user`, data),
      changePassword: (data) => client.put(`/user/change-password`, data),
      searchUserByKeyword: (keyword) => client.get(`/user/search`, { params: { keyword } }).then((res) => res.data),
      getEmailSettings: () => client.get('/user/email-settings').then((res) => res.data),
      updateUserEmailSettings: (data) => client.put('/user/email-settings', data).then((res) => res.data),
      sendResetUserPasswordEmail: (data) =>
        client.post('/user/forgot-password/send-reset-email', data).then((res) => res.data),
      validateResetPassword: (data) => client.post('/user/forgot-password/reset', data).then((res) => res.data),
      admin: {
        getById: (userId) => client.get(`/admin/user/${userId}`).then((res) => res.data),
        getAll: (params) => client.get(`/admin/user`, { params }).then((res) => res.data),
        update: (userId, data) => client.patch(`/admin/user/${userId}`, data),
        delete: (userId) => client.delete(`/admin/user/${userId}`),
      },
    },
    wishlist: {
      getAll: (params) => client.get(`/wishlist`, { params }).then((res) => res.data),
      getById: (wishlistId) => client.get(`/wishlist/${wishlistId}`).then((res) => res.data),
      create: (data) => client.post('/wishlist', data).then((res) => res.data),
      update: (wishlistId, data) => client.put(`/wishlist/${wishlistId}`, data),
      delete: (wishlistId) => client.delete(`/wishlist/${wishlistId}`),
      linkWishlistToAnEvent: (wishlistId, data) => client.post(`/wishlist/${wishlistId}/link-event`, data),
      unlinkWishlistToAnEvent: (wishlistId, data) => client.post(`/wishlist/${wishlistId}/unlink-event`, data),
    },
    event: {
      getAll: (params) => client.get(`/event`, { params }).then((res) => res.data),
      getById: (eventId) => client.get(`/event/${eventId}`).then((res) => res.data),
      create: (data) => client.post('/event', data).then((res) => res.data),
      update: (eventId, data) => client.put(`/event/${eventId}`, data),
      delete: (eventId) => client.delete(`/event/${eventId}`),
      admin: {
        getAll: (params) => client.get('/admin/event', { params }).then((res) => res.data),
        getById: (eventId) => client.get(`/admin/event/${eventId}`).then((res) => res.data),
      },
    },
    item: {
      create: (data) => client.post('/item', data).then((res) => res.data),
      update: (itemId, data) => client.put(`/item/${itemId}`, data),
      delete: (itemId) => client.delete(`/item/${itemId}`),
      toggle: (itemId) => client.post(`/item/${itemId}/toggle`).then((res) => res.data),
    },
    attendee: {
      addAttendee: (data) => client.post('/attendee', data).then((res) => res.data),
      deleteAttendee: (attendeeId) => client.delete(`/attendee/${attendeeId}`),
    },
  };
}
