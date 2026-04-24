const BASE_URL = 'http://localhost:3000';
export const API = {
  // GET
  async get(endpoint) {
    try {
      const response = await fetch(BASE_URL+endpoint);
      if (!response.ok) throw new Error(`Erreur serveur: ${response.status}`);
      return await response.json(); // Retourne directement les données propres
    } catch (error) {
      console.error(`[API GET] Erreur sur ${endpoint} :`, error);
      throw error;
    }
  },

  //  POST
  async post(endpoint, data) {
    try {
      const response = await fetch(BASE_URL + endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(`Erreur serveur: ${response.status}`);
      return response;
    } catch (error) {
      console.error(`[API POST] Erreur sur ${endpoint} :`, error);
      throw error;
    }
  },
  //  PUT
  async put(endpoint, data) {
    try {
      const response = await fetch(BASE_URL + endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(`Erreur serveur: ${response.status}`);
      const result = await response.text();
      return result ? JSON.parse(result) : {};
    } catch (error) {
      console.error(`[API PUT] Erreur sur ${endpoint} :`, error);
      throw error;
    }
  },
  //DELETE
  async delete(endpoint) {
    try {
      const response = await fetch(BASE_URL + endpoint, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error(`Erreur serveur: ${response.status}`);
      return true;
    } catch (error) {
      console.error(`[API DELETE] Erreur sur ${endpoint} :`, error);
      throw error;
    }
  },
};