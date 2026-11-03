package com.network.topology.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

@Component
public class CanvasJsonValidator {

    private static final String EMPTY_CANVAS =
            "{\"nodes\":[],\"edges\":[],\"viewport\":{\"x\":0,\"y\":0,\"zoom\":1}}";

    private final ObjectMapper objectMapper;

    public CanvasJsonValidator(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public String emptyCanvasJson() {
        return EMPTY_CANVAS;
    }

    public String toJsonString(JsonNode canvasData) {
        if (canvasData == null || canvasData.isNull()) {
            return EMPTY_CANVAS;
        }
        validateStructure(canvasData);
        try {
            return objectMapper.writeValueAsString(canvasData);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Invalid canvasData JSON");
        }
    }

    public JsonNode parseCanvas(String json) {
        try {
            JsonNode node = objectMapper.readTree(json);
            validateStructure(node);
            return node;
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Stored canvasData is not valid JSON");
        }
    }

    private void validateStructure(JsonNode canvasData) {
        if (!canvasData.isObject()) {
            throw new IllegalArgumentException("canvasData must be a JSON object");
        }
        if (!canvasData.has("nodes") || !canvasData.get("nodes").isArray()) {
            throw new IllegalArgumentException("canvasData must contain a nodes array");
        }
        if (!canvasData.has("edges") || !canvasData.get("edges").isArray()) {
            throw new IllegalArgumentException("canvasData must contain an edges array");
        }
    }
}
