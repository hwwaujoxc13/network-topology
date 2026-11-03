package com.network.topology.repository;

import com.network.topology.entity.Topology;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TopologyRepository extends JpaRepository<Topology, Long> {

    List<Topology> findAllByOrderByUpdatedAtDesc();
}
