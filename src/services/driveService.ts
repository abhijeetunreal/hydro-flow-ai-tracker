
const DRIVE_API_URL = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3';
const FILE_NAME = 'aquatrack.data.json';

export type DriveFile = {
  id: string;
  name: string;
};

// Search for the app's data file in the appDataFolder
export const findDataFile = async (accessToken: string): Promise<DriveFile | null> => {
  const query = `name='${FILE_NAME}' and 'appDataFolder' in parents`;
  const response = await fetch(
    `${DRIVE_API_URL}/files?q=${encodeURIComponent(query)}&spaces=appDataFolder&fields=files(id,name)`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  if (!response.ok) {
    console.error('Failed to find file', await response.json());
    return null;
  }
  const data = await response.json();
  return data.files.length > 0 ? data.files[0] : null;
};

// Read file content from the appDataFolder
export const readFileContent = async (accessToken: string, fileId: string): Promise<any> => {
  const response = await fetch(`${DRIVE_API_URL}/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) {
    console.error('Failed to read file', await response.json());
    return null;
  }
  return response.json();
};

// Create a new data file in the appDataFolder
export const createDataFile = async (accessToken: string, content: object): Promise<DriveFile | null> => {
  const metadata = {
    name: FILE_NAME,
    parents: ['appDataFolder'],
    mimeType: 'application/json',
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', new Blob([JSON.stringify(content)], { type: 'application/json' }));

  const response = await fetch(`${DRIVE_UPLOAD_URL}/files?uploadType=multipart`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: form,
  });

  if (!response.ok) {
    console.error('Failed to create file', await response.json());
    return null;
  }
  return response.json();
};

// Update an existing file in the appDataFolder
export const updateDataFile = async (accessToken: string, fileId: string, content: object): Promise<DriveFile | null> => {
  const response = await fetch(`${DRIVE_UPLOAD_URL}/files/${fileId}?uploadType=media`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(content),
  });

  if (!response.ok) {
    console.error('Failed to update file', await response.json());
    return null;
  }
  return response.json();
};
