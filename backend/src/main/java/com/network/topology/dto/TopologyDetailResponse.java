package com.network.topology.dto;

import com.fasterxml.jackson.databind.JsonNode;
import java.time.Instant;

public record TopologyDetailResponse(
        Long id,
        String name,
        JsonNode canvasData,
        Instant createdAt,
        Instant updatedAt
) {}
