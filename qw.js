// Cloudflare Worker: direct download for large Google Drive files (skips the virus-scan warning page)
const FILE_ID = "1gOEDWBu-5owl_Lqn7ZcHGka7KYSWL0Ap";
const BASE = "https://drive.usercontent.google.com/download";

export default {
    async fetch(request) {
        const first = `${BASE}?id=${FILE_ID}&export=download`;
        let target = `${first}&confirm=t`;

        try {
            const res = await fetch(first, { redirect: "follow" });
            const type = res.headers.get("content-type") || "";

            if (type.includes("text/html")) {
                // Warning page: pull the hidden form fields (uuid, at, etc.)
                const html = await res.text();
                const uuid = (html.match(/name="uuid"\s+value="([^"]+)"/) || [])[1];
                const at = (html.match(/name="at"\s+value="([^"]+)"/) || [])[1];
                target = `${first}&confirm=t` + (uuid ? `&uuid=${uuid}` : "") + (at ? `&at=${encodeURIComponent(at)}` : "");
            } else {
                // File is small enough to download directly
                target = first;
            }
        } catch (e) {
            // fall back to the plain confirm=t link
        }

        return Response.redirect(target, 302);
    },
};