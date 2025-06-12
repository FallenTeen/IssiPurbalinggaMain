<?php

namespace App\Services;

use Google\Client;
use Google\Service\Drive;
use Google\Service\Drive\DriveFile;

class GoogleDriveService
{
    protected $client;
    protected $service;

    public function __construct()
    {
        $this->client = new Client();
        $this->client->setAuthConfig(storage_path('app/google/credentials.json'));
        $this->client->addScope(Drive::DRIVE);
        $this->service = new Drive($this->client);
    }

    public function uploadFile($filePath, $fileName, $mimeType, $folderId = null)
    {
        $fileMetadata = new DriveFile([
            'name' => $fileName,
            'parents' => [$folderId ?? config('services.google.folder_id')]
        ]);

        $content = file_get_contents($filePath);

        $file = $this->service->files->create($fileMetadata, [
            'data' => $content,
            'mimeType' => $mimeType,
            'uploadType' => 'multipart',
            'fields' => 'id'
        ]);

        return $file->id;
    }
}
