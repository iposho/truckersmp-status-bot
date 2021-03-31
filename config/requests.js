const axios = require('axios');
const fetch = require('node-fetch');

const BASE_URL = 'https://api.truckersmp.com/v2';
const TRUCKY_URL = 'http://api.truckyapp.com/v2';

module.exports = {
  getGeneralStatus: () => axios.get(`${BASE_URL}/version`),
  getGameTime: () => fetch(`${TRUCKY_URL}/truckersmp/time`),
  getServersStatus: () => axios.get(`${BASE_URL}/servers`),
};
