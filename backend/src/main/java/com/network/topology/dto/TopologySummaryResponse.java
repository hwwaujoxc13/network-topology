package com.network.topology.dto;

import java.time.Instant;

public record TopologySummaryResponse(Long id, String name, Instant updatedAt) {}
