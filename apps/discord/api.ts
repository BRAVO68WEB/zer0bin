import config from './config.json';

const API_URL = config.api_url;
const PUBLIC_URL = config.public_url;

export const postPaste = async (content: string) => {
	let paste_url;
    let success = false;
    const payload = { content, single_view: false }
	
	await fetch(`${API_URL}/p/n`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
	})
		.then((response) => response.json())
		.then((data) => {
			if (data["success"]) {
                success = true;
                paste_url = `${PUBLIC_URL}/${data["data"]["id"]}`;
			}
		})
        .catch((error) => {
            console.error("Error:", error);
        });

    return { success, paste_url };
}