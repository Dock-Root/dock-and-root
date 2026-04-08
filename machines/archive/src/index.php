<!DOCTYPE html>
<html>
<head>
    <title>Archive Center</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 50px; background-color: #fce4ec; }
        .container { background-color: white; padding: 30px; border-radius: 10px; max-width: 500px; margin: 0 auto; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
        h1 { color: #d81b60; }
        input[type="submit"] { background-color: #d81b60; color: white; border: none; padding: 10px 20px; cursor: pointer; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Internal Archive Center</h1>
        <p>Please upload your documents here for archiving. Note: Our system performs a cleanup of the archives directory every minute to save space.</p>
        <form action="upload.php" method="post" enctype="multipart/form-data">
            Select image to upload:
            <input type="file" name="fileToUpload" id="fileToUpload">
            <input type="submit" value="Upload Image" name="submit">
        </form>
    </div>
</body>
</html>
