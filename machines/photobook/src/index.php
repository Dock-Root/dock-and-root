<?php
$page = isset($_GET['page']) ? $_GET['page'] : 'home.php';
?>
<!DOCTYPE html>
<html>
<head>
    <title>Photobook - Developer Blog</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        header { background-color: #333; color: white; padding: 20px; text-align: center; }
        nav { background-color: #444; padding: 10px; text-align: center; }
        nav a { color: white; text-decoration: none; padding: 10px; margin: 0 5px; }
        nav a:hover { background-color: #555; }
        .content { margin: 20px auto; max-width: 800px; padding: 20px; background-color: white; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
    </style>
</head>
<body>
    <header>
        <h1>Photobook Blog</h1>
        <p>A simple developer diary.</p>
    </header>
    <nav>
        <a href="index.php?page=home.php">Home</a>
        <a href="index.php?page=about.php">About</a>
    </nav>
    <div class="content">
        <?php
            // Vulnerability: LFI
            include($page);
        ?>
    </div>
</body>
</html>
