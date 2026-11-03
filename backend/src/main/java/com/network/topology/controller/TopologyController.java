package com.network.topology.controller;

import com.network.topology.dto.CreateTopologyRequest;
import com.network.topology.dto.TopologyDetailResponse;
import com.network.topology.dto.TopologySummaryResponse;
import com.network.topology.dto.UpdateTopologyRequest;
import com.network.topology.service.TopologyService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/topologies")
public class TopologyController {

    private final TopologyService topologyService;

    public TopologyController(TopologyService topologyService) {
        this.topologyService = topologyService;
    }

    @GetMapping
    public List<TopologySummaryResponse> list() {
        return topologyService.listAll();
    }

    @GetMapping("/{id}")
    public TopologyDetailResponse get(@PathVariable Long id) {
        return topologyService.getById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TopologyDetailResponse create(@Valid @RequestBody CreateTopologyRequest request) {
        return topologyService.create(request);
    }

    @PutMapping("/{id}")
    public TopologyDetailResponse update(@PathVariable Long id, @Valid @RequestBody UpdateTopologyRequest request) {
        return topologyService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        topologyService.delete(id);
    }
}
