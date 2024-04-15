const SCOPE = 'https://www.googleapis.com/auth/drive.file';
const CLIENT_ID = import.meta.env.GOOGLE_CLIENT_ID;

class GoogleDriveService {

    private access_token!: string;

    public init(): Promise<string|undefined> {
        return new Promise<string|undefined>(resolve => {
            const script = document.createElement("script");
            script.src = "https://accounts.google.com/gsi/client";
            script.async = true;
            script.onload = () => {
                //@ts-ignore
                const client = google.accounts.oauth2.initTokenClient({
                    client_id: CLIENT_ID,
                    scope: SCOPE,
                    prompt: '',
                    callback: async (response) => {
                        this.access_token = response.access_token;
                        resolve(response.access_token);
                    },
                    error_callback: (error) => {
                        console.log(`error_callback: ${JSON.stringify(error)}`);
                        resolve(undefined);
                    }
                });
                client.requestAccessToken();
             };
            document.body.appendChild(script);
        });
    };
    
    public async createFolderIfNotExists(folderName: string): Promise<string> {
        try {
            // Check if the folder already exists
            const folderId = await this.findFolder(folderName, this.access_token);
            if (folderId) {
                console.log('Folder already exists. Folder ID:', folderId);
                return folderId;
            }
    
            // If the folder doesn't exist, create it
            const newFolderId = await this.createFolder(folderName, this.access_token);
            console.log('Folder created successfully. Folder ID:', newFolderId);
            return newFolderId;
        } catch (error) {
            console.error('Error creating or checking folder:', error);
            throw error;
        }
    }
    
    public async findFolder(folderName: string): Promise<string | null> {
        const url = `https://www.googleapis.com/drive/v3/files`;
        const queryParams = {
            q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`
        };
        const searchUrl = new URL(url);
        searchUrl.search = new URLSearchParams(queryParams).toString();
    
        const response = await fetch(searchUrl.toString(), {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this.access_token}`
            }
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data.files.length > 0 ? data.files[0].id : null;
    }
    
    public async createFolder(folderName: string): Promise<string> {
        const url = 'https://www.googleapis.com/drive/v3/files';
        const metadata = {
            'name': folderName,
            'mimeType': 'application/vnd.google-apps.folder'
        };
    
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.access_token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(metadata)
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data.id;
    }
    
    public async uploadJsonToFolder(jsonData: any, filename: string, folderId: string): Promise<string> {
        try {
            // Check if the file already exists in the folder
            const existingFileId = await this.findFile(filename, folderId, this.access_token);
            if (existingFileId) {
                // File already exists, update its content
                await this.updateFileContent(existingFileId, jsonData, filename, this.access_token);
                console.log('File updated successfully. File ID:', existingFileId);
                return existingFileId;
            }
            // File does not exist, create a new file
            const newFileId = await this.createFile(jsonData, filename, folderId, this.access_token);
            console.log('File created successfully. File ID:', newFileId);
            return newFileId;
        } catch (error) {
            console.error('Error uploading JSON file:', error);
            throw error;
        }
    }
    
    public async findFile(filename: string, folderId: string): Promise<string | null> {
        try {
            const url = 'https://www.googleapis.com/drive/v3/files';
            const queryParams = {
                q: `name='${filename}' and '${folderId}' in parents and trashed=false`
            };
            const searchUrl = new URL(url);
            searchUrl.search = new URLSearchParams(queryParams).toString();
    
            const response = await fetch(searchUrl.toString(), {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.access_token}`
                }
            });
    
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
    
            const data = await response.json();
            return data.files.length > 0 ? data.files[0].id : null;
        } catch (error) {
            console.error('Error finding file:', error);
            throw error;
        }
    }
    
    public async getFileContent(fileId: string): Promise<string | null> {
        try {
            const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
    
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.access_token}`
                }
            });
    
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
    
            const data = await response.text();
            return data;
        } catch (error) {
            console.error('Error getting file content:', error);
            throw error;
        }
    }
    
    
    public async createFile(jsonData: any, filename: string, folderId: string): Promise<string> {
        try {
            const metadata = {
                'name': filename,
                'parents': [folderId],
                'mimeType': 'application/json'
            };
    
            const formData = new FormData();
            formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
            formData.append('file', new Blob([JSON.stringify(jsonData)], { type: 'application/json' }));
    
            const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.access_token}`,
                },
                body: formData
            });
    
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
    
            const data = await response.json();
            return data.id;
        } catch (error) {
            console.error('Error creating file:', error);
            throw error;
        }
    }
    
    public async updateFileContent(fileId: string, jsonData: any, filename: string): Promise<void> {
        try {
            const metadata = {
                'name': filename
            };
    
            const formData = new FormData();
            formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
            formData.append('file', new Blob([JSON.stringify(jsonData)], { type: 'application/json' }));
    
            const response = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${this.access_token}`,
                },
                body: formData
            });
    
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
        } catch (error) {
            console.error('Error updating file content:', error);
            throw error;
        }
    }
}

export const googleDriveService = new GoogleDriveService();
