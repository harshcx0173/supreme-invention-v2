const axios = require('axios');

class AzureMapsService {
  constructor() {
    this.apiKey = process.env.AZURE_MAPS_KEY;
    this.baseUrl = 'https://atlas.microsoft.com';
    console.log('Azure Maps API Key loaded:', this.apiKey ? 'Yes' : 'No');
    if (this.apiKey) {
      console.log('API Key starts with:', this.apiKey.substring(0, 10) + '...');
    }
  }

  // Geocode an address to get coordinates
  async geocodeAddress(address) {
    try {
      if (!this.apiKey) {
        console.warn('Azure Maps API key not configured.');
        throw new Error('Azure Maps API key not configured');
      }
      console.log('Making Azure Maps API call for address:', address);
      const response = await axios.get(`${this.baseUrl}/search/address/json`, {
        params: {
          'api-version': '1.0',
          'subscription-key': this.apiKey,
          'query': address
        }
      });
      console.log('Azure Maps API response status:', response.status);
      console.log('Azure Maps API response:', response.data);
      if (response.data.results && response.data.results.length > 0) {
        const result = response.data.results[0];
        const location = result.position;
        return {
          success: true,
          coordinates: {
            lat: location.lat,
            lng: location.lon
          },
          formattedAddress: result.address.freeformAddress,
          addressComponents: {
            city: result.address.municipality || '',
            state: result.address.countrySubdivision || '',
            country: result.address.country || '',
            postalCode: result.address.postalCode || ''
          }
        };
      } else {
        throw new Error('No results from Azure Maps geocoding');
      }
    } catch (error) {
      console.error('Error geocoding address with Azure Maps:', error);
      throw new Error('Geocoding failed: ' + error.message);
    }
  }

  // Validate and format location data
  async validateLocation(locationData) {
    try {
      const address = [
        locationData.address,
        locationData.city,
        locationData.state,
        locationData.postalCode,
        locationData.country
      ].filter(Boolean).join(', ');
      const geocodeResult = await this.geocodeAddress(address);
      return {
        ...locationData,
        coordinates: geocodeResult.coordinates,
        formattedAddress: geocodeResult.formattedAddress,
        googleMapsLink: this.generateMapsLink(geocodeResult)
      };
    } catch (error) {
      console.error('Error validating location with Azure Maps:', error);
      // Fallback: return the original data with no coordinates
      return {
        ...locationData,
        coordinates: null,
        formattedAddress: `${locationData.address}, ${locationData.city}, ${locationData.state}, ${locationData.country}`,
        googleMapsLink: this.generateMapsLink({ formattedAddress: `${locationData.address}, ${locationData.city}` })
      };
    }
  }

  // Generate Azure/Bing Maps link
  generateMapsLink(location) {
    if (location.coordinates) {
      const { lat, lng } = location.coordinates;
      return `https://www.bing.com/maps?cp=${lat}~${lng}`;
    } else if (location.formattedAddress) {
      const encodedAddress = encodeURIComponent(location.formattedAddress);
      return `https://www.bing.com/maps?q=${encodedAddress}`;
    } else {
      return null;
    }
  }
}

module.exports = new AzureMapsService();