package com.memoflow.memoflow.service;

import java.io.IOException;
import java.util.Map;

import org.springframework.web.multipart.MultipartFile;

public interface CloudinaryService {
    public Map<String, String> uploadFile(MultipartFile file, String folder) throws IOException;
    public String updateFile(String publicId, MultipartFile newFile) throws IOException;
    public String deleteImage(String publicId) throws IOException;
}
