import React, { useEffect, useState } from "react";
import apiClient from "../axios-config";

function Downloads() {
    const [downloads, setDownloads] = useState([]);

    useEffect(() => {
        apiClient.get("/public/get_downloads.php")
            .then(response => {
                setDownloads(response.data.downloads || []);
            })
            .catch(error => console.error("Error fetching downloads:", error));
    }, []);

    return (
        <div className="container container-dark">
            <h2>Download Page</h2>
            <p>Download Client / Patcher</p>
            <ul className="list-group">
                {downloads.length > 0 ? (
                    downloads.map((file) => (
                        <li key={file.id} className="list-group-item">
                            <a href={file.link} target="_blank" rel="noopener noreferrer">
                                {file.name}
                            </a>
                        </li>
                    ))
                ) : (
                    <p>No downloads available.</p>
                )}
            </ul>
        </div>
    );
}

export default Downloads;
