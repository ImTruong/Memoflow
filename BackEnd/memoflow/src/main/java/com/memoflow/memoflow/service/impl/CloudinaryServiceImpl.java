package com.memoflow.memoflow.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.memoflow.memoflow.service.CloudinaryService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryServiceImpl implements CloudinaryService{
    private final Cloudinary cloudinary;

    @Autowired
    public CloudinaryServiceImpl(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    public Map<String, String> uploadFile(MultipartFile file, String folder) throws IOException {
        Map uploadResult = cloudinary.uploader().upload(file.getBytes(),
                ObjectUtils.asMap(
                        "resource_type", "auto",
                        "folder", "flashEng/" + folder
                ));

        // Lưu cả URL và publicId vào Map và trả về
        return Map.of(
                "url", uploadResult.get("secure_url").toString(),
                "publicId", uploadResult.get("public_id").toString()
        );
    }

    // Cập nhật ảnh với public ID (truyền vào file mới nếu muốn thay thế ảnh cũ)
    public String updateFile(String publicId, MultipartFile newFile) throws IOException {
        Map updateResult = cloudinary.uploader().upload(newFile.getBytes(),
                ObjectUtils.asMap(
                        "public_id", publicId,
                        "overwrite", true // Ghi đè lên ảnh cũ
                ));
        return updateResult.get("url").toString();
    }

    // Xóa ảnh với public ID
    public String deleteImage(String publicId) throws IOException {
        Map deleteResult = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        return deleteResult.get("result").toString();
    }
}
