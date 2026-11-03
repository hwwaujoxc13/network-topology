package com.network.topology.service;

import com.network.topology.dto.CreateTopologyRequest;
import com.network.topology.dto.TopologyDetailResponse;
import com.network.topology.dto.TopologySummaryResponse;
import com.network.topology.dto.UpdateTopologyRequest;
import com.network.topology.entity.Topology;
import com.network.topology.repository.TopologyRepository;
import com.network.topology.util.CanvasJsonValidator;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional(readOnly = true)
public class TopologyService {

    private final TopologyRepository topologyRepository;
    private final CanvasJsonValidator canvasJsonValidator;

    public TopologyService(TopologyRepository topologyRepository, CanvasJsonValidator canvasJsonValidator) {
        this.topologyRepository = topologyRepository;
        this.canvasJsonValidator = canvasJsonValidator;
    }

    public List<TopologySummaryResponse> listAll() {
        return topologyRepository.findAllByOrderByUpdatedAtDesc().stream()
                .map(t -> new TopologySummaryResponse(t.getId(), t.getName(), t.getUpdatedAt()))
                .toList();
    }

    public TopologyDetailResponse getById(Long id) {
        Topology topology = findOrThrow(id);
        return toDetail(topology);
    }

    @Transactional
    public TopologyDetailResponse create(CreateTopologyRequest request) {
        Topology topology = new Topology();
        topology.setName(request.name().trim());
        topology.setCanvasData(canvasJsonValidator.toJsonString(request.canvasData()));
        Topology saved = topologyRepository.save(topology);
        return toDetail(saved);
    }

    @Transactional
    public TopologyDetailResponse update(Long id, UpdateTopologyRequest request) {
        Topology topology = findOrThrow(id);
        topology.setName(request.name().trim());
        topology.setCanvasData(canvasJsonValidator.toJsonString(request.canvasData()));
        return toDetail(topology);
    }

    @Transactional
    public void delete(Long id) {
        if (!topologyRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Topology not found");
        }
        topologyRepository.deleteById(id);
    }

    private Topology findOrThrow(Long id) {
        return topologyRepository
                .findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Topology not found"));
    }

    private TopologyDetailResponse toDetail(Topology topology) {
        return new TopologyDetailResponse(
                topology.getId(),
                topology.getName(),
                canvasJsonValidator.parseCanvas(topology.getCanvasData()),
                topology.getCreatedAt(),
                topology.getUpdatedAt());
    }
}
