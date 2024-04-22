import '../src/styles/loader.scss';

const SCOPE = 'https://www.googleapis.com/auth/drive.file';
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const theme = localStorage.getItem('theme') || 'dark';
const renewAccessToken = (localStorage.getItem('renew') == 'true');
if ('dark' == theme) document.body.style.backgroundColor = 'black';
const client = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPE,
    prompt: renewAccessToken ? '' : 'consent',
    callback: async (response) => {;
        localStorage.setItem("GOOGLE_ACCESS_TOKEN", response.access_token);
        window.close();
    },
    error_callback: (error) => {
        localStorage.setItem("GOOGLE_ACCESS_TOKEN_ERROR", JSON.stringify(error));
        window.close();
    }
});
client.requestAccessToken();
