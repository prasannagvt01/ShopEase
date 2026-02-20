package com.ecommerce.service;

import com.ecommerce.dto.request.WarehouseRequest;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.model.Warehouse;
import com.ecommerce.repository.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WarehouseService {

    private final WarehouseRepository warehouseRepository;

    public List<Warehouse> getAllWarehouses() {
        return warehouseRepository.findAll();
    }

    public Warehouse getWarehouseById(String id) {
        return warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", "id", id));
    }

    public Warehouse createWarehouse(WarehouseRequest request) {
        Warehouse warehouse = Warehouse.builder()
                .name(request.getName())
                .address(request.getAddress())
                .city(request.getCity())
                .state(request.getState())
                .contactNumber(request.getContactNumber())
                .active(request.isActive())
                .build();
        return warehouseRepository.save(warehouse);
    }

    public Warehouse updateWarehouse(String id, WarehouseRequest request) {
        Warehouse warehouse = getWarehouseById(id);
        warehouse.setName(request.getName());
        warehouse.setAddress(request.getAddress());
        warehouse.setCity(request.getCity());
        warehouse.setState(request.getState());
        warehouse.setContactNumber(request.getContactNumber());
        warehouse.setActive(request.isActive());
        return warehouseRepository.save(warehouse);
    }

    public void deleteWarehouse(String id) {
        if (!warehouseRepository.existsById(id)) {
            throw new ResourceNotFoundException("Warehouse", "id", id);
        }
        warehouseRepository.deleteById(id);
    }
}
