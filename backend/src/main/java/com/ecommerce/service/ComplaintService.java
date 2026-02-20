package com.ecommerce.service;

import com.ecommerce.model.Complaint;
import com.ecommerce.repository.ComplaintRepository;
import com.ecommerce.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ComplaintService {

    private final ComplaintRepository complaintRepository;

    public Page<Complaint> getAllComplaints(Pageable pageable) {
        return complaintRepository.findAll(pageable);
    }

    public Complaint getComplaintById(String id) {
        return complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint", "id", id));
    }

    @Transactional
    public Complaint updateComplaintStatus(String id, Complaint.ComplaintStatus status, String notes) {
        Complaint complaint = getComplaintById(id);
        complaint.setStatus(status);
        if (notes != null) {
            complaint.setAdminNotes(notes);
        }
        return complaintRepository.save(complaint);
    }

    @Transactional
    public Complaint resolveComplaint(String id, String resolution) {
        Complaint complaint = getComplaintById(id);
        complaint.setStatus(Complaint.ComplaintStatus.RESOLVED);
        complaint.setResolution(resolution);
        return complaintRepository.save(complaint);
    }

    @Transactional
    public Complaint createComplaint(Complaint complaint) {
        return complaintRepository.save(complaint);
    }
}
