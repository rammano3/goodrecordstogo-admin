import React, { useState } from 'react';

function downloadFile(fileName, urlData) {
  var aLink = document.createElement('a');
  aLink.download = fileName;
  aLink.href = urlData;

  var event = new MouseEvent('click');
  aLink.dispatchEvent(event);
}

function ProcessCSV() {
  const [file, setFile] = useState();
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = () => {
    setLoading(true);

    const formData = new FormData();
    formData.append('myFile', file);
    fetch('/.netlify/functions/transform-discog-csv', {
      method: 'POST',
      body: formData,
    })
      .then((response) => response.text())
      .then((data) => {
        setLoading(false);
        downloadFile(
          `discog-shopify-${Date.now()}.csv`,
          'data:text/csv;charset=UTF-8,' + encodeURIComponent(data)
        );
      })
      .catch((error) => {
        setLoading(false);
        console.error(error);
      });
  };

  return (
    <div>
      <h1>Upload CSV</h1>
      <input type="file" name="file" onChange={handleFileChange} />
      {loading && <div>loading...</div>}
      {!loading && file && <button onClick={handleUpload}>Submit</button>}
    </div>
  );
}

export default ProcessCSV;
