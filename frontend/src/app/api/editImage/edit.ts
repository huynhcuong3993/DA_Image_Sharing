import axios from "axios";

const API_URL = "http://localhost:3000";

export const uploadImage = async (file: File, userId: string, description: string, token: string) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("userId", userId);
  formData.append("description", description);

  const response = await axios.post(`${API_URL}/images/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`, //   Thêm token vào headers
    },
  });
  return response.data;
};

export const applyEffect = async (imageId: string, effect: string, token: string) => {
  console.log("applyEffect", effect);
  const response = await axios.post(
    `${API_URL}/images/effect/${imageId}`,
    { effect },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, //   Thêm token vào headers
      },
    }
  );
  return response.data;
};

export const removeBackground = async (imageId: string, token: string) => {
  const response = await axios.post(
    `${API_URL}/images/remove-background/${imageId}`,
    {},
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, //   Thêm token vào headers
      },
    }
  );
  return response.data;
};

export const blurBackground = async (imageId: string, token: string) => {
  const response = await axios.post(
    `${API_URL}/images/blur-background/${imageId}`,
    {},
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, //   Thêm token vào headers
      },
    }
  );
  return response.data;
};

export const artisticStyle = async (imageId: string, style: string, token: string) => {
  const response = await axios.post(
    `${API_URL}/images/artistic-style/${imageId}`,
    { style },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, //   Thêm token vào headers
      },
    }
  );
  return response.data;
};

export const getUserImages = async (userId: string, token: string) => {
  const response = await axios.get(`${API_URL}/images/user/${userId}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, //   Thêm token vào headers
    },
  });
  return response.data;
};

export const getImageDetails = async (imageId: string, token: string) => {
  const response = await axios.get(`${API_URL}/images/${imageId}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, //   Thêm token vào headers
    },
  });
  return response.data;
};
export async function adjustBrightness(imageId: string, level: number, token: string) {
    const response = await axios.post(
        `${API_URL}/images/${imageId}/brightness`,
        { level },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, //   Thêm token vào headers
          },
        }
      );
    console.log(response.data);

      return response.data.editedUrl;
}

export async function adjustColor(imageId: string, level: number, token: string) {
  const response = await axios.post(
      `${API_URL}/images/${imageId}/color`,
      { level },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, //   Thêm token vào headers
        },
      }
    );
  console.log(response.data);

    return response.data.editedUrl;
}

export async function adjustContrast(imageId: string, level: number, token: string) {
  const response = await axios.post(
      `${API_URL}/images/${imageId}/contrast`,
      { level },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, //   Thêm token vào headers
        },
      }
    );
  console.log(response.data);

    return response.data.editedUrl;
}