package com.domain.chat_app.file.service.impl;

import com.domain.chat_app.file.service.FileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
@RequiredArgsConstructor
@Slf4j
public class FileServiceImpl implements FileService{

    @Value("${spring.application.file.uploads.media-output-path}")
    private String fileUploadPath;
    public String saveFile(@NonNull MultipartFile file, @NonNull String senderId) {
        final String fileUploadSubPath ="users"+ File.separator+senderId;
        return uploadFile(file,fileUploadSubPath);
    }

    private String uploadFile(@NonNull MultipartFile file,@NonNull String fileUploadSubPath) {
        final String finalUploadPath=fileUploadPath+File.separator+fileUploadSubPath;
        File targetFolder = new File(finalUploadPath);
        if(!targetFolder.exists()){
           boolean foldersCreated= targetFolder.mkdirs();
           if(!foldersCreated){
               log.warn("Unable to create the directory {}",finalUploadPath);
               return null;
           }
        }
        final String fileExtension=getFileExtension(file.getOriginalFilename());
        String targetFilePath=finalUploadPath+File.separator+System.currentTimeMillis()+fileExtension;
        Path targetPath= Paths.get(targetFilePath);
        try{
            Files.write(targetPath,file.getBytes());
            log.info("File {} uploaded successfully",targetFilePath);
            return targetFilePath;
        }catch (IOException e){
            log.error(e.getMessage(),e);
        }
        return null;
    }

    private String getFileExtension( String originalFilename) {
        if(originalFilename == null){
            return "";
        }
        int lastDotIndex = originalFilename.lastIndexOf('.');
        if(lastDotIndex == -1){
            return "";
        }
        return originalFilename.substring(lastDotIndex+1).toLowerCase();
    }

}
