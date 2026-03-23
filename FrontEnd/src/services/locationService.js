import axios from "axios";

const locationService = {
  searchAddress: async (query) => {
    const response = await axios.get("https://nominatim.openstreetmap.org/search", {
      params: {
        format: "json",
        q: query,
      },
    });

    return Array.isArray(response.data) ? response.data : [];
  },
};

export default locationService;
