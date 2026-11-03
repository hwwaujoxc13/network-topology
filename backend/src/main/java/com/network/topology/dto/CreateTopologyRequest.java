package com.network.topology.dto;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateTopologyRequest(
        @NotBlank(message = "name must not be blank") String name,
        JsonNode canvasData
) {}
