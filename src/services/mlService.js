// Use proxy path for Vite dev server, direct URL for production
const ML_API_URL = import.meta.env.DEV ? '/api/ml' : 'http://localhost:8000';

export const mlService = {
  // Get supported crops from ML API
  async getSupportedCrops() {
    try {
      const response = await fetch(`${ML_API_URL}/supported-options`);
      const data = await response.json();
      return data.crops || [];
    } catch (error) {
      console.error('Error fetching crops:', error);
      return ['Wheat', 'Rice', 'Cotton', 'Sugarcane', 'Maize', 'Barley', 'Millets', 'Ground Nuts', 'Oil seeds', 'Paddy', 'Pulses', 'Tobacco'];
    }
  },

  // Get supported soil types from ML API
  async getSupportedSoils() {
    try {
      const response = await fetch(`${ML_API_URL}/supported-options`);
      const data = await response.json();
      return data.soils || [];
    } catch (error) {
      console.error('Error fetching soils:', error);
      return ['Loamy', 'Sandy', 'Clayey', 'Black', 'Red'];
    }
  },

  // Get fertilizer prediction from ML API
  async predictFertilizer(data) {
    try {
      const response = await fetch(`${ML_API_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to get prediction from ML API');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error predicting fertilizer:', error);
      throw new Error('Unable to connect to ML service. Please make sure the backend is running.');
    }
  },

  // Health check for ML API
  async checkHealth() {
    try {
      const response = await fetch(`${ML_API_URL}/health`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }
};
