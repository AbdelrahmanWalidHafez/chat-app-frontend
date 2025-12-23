package com.domain.chat_app.file.utils;

import lombok.extern.slf4j.Slf4j;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Slf4j
public abstract class FileUtils {

    public static byte[] readFileFromLocation(String fileUrl){
        if (StringUtils.isEmpty(fileUrl)) {
            return new byte[0];
        }
            try {
                Path path = Paths.get(fileUrl);
                return Files.readAllBytes(path);
            } catch (IOException e) {
                log.warn(e.getMessage(), e);
            }
        return new byte[0];
        }
}
