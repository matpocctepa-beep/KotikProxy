<?php
// 1. Считаем статистику
$statsFile = 'stats.json';

if (file_exists($statsFile)) {
    $stats = json_decode(file_get_contents($statsFile), true);
    $stats['downloads'] = ($stats['downloads'] ?? 0) + 1;
    file_put_contents($statsFile, json_encode($stats));
}

// 2. Отдаём файл пользователю
$file = 'Kot-vps.apk';

if (file_exists($file)) {
    header('Content-Description: File Transfer');
    header('Content-Type: application/vnd.android.package-archive');
    header('Content-Disposition: attachment; filename="'.basename($file).'"');
    header('Expires: 0');
    header('Cache-Control: must-revalidate');
    header('Pragma: public');
    header('Content-Length: ' . filesize($file));
    
    // Сбрасываем буфер вывода и читаем файл
    ob_clean();
    flush();
    readfile($file);
    exit;
} else {
    echo "Файл не найден. Загрузите APK через админ-панель.";
}
?>
