const baseUrl = 'http://localhost:8086/dap/asset';
export const environment = {
  production: true,
  baseUrl: baseUrl,
  loginUrl: baseUrl + '/v1/accessController/auth',
  ubicacionFindAll: baseUrl + '/v1/ubicacionController/findAll',
  ubicacionFindById: baseUrl + '/v1/ubicacionController/findById',
  ubicacionSave: baseUrl + '/v1/ubicacionController/save',
  ubicacionUpdate: baseUrl + '/v1/ubicacionController/update',
};
