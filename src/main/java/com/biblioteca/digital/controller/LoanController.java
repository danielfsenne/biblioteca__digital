package com.biblioteca.digital.controller;

import com.biblioteca.digital.dto.LoanRequest;
import com.biblioteca.digital.entity.Loan;
import com.biblioteca.digital.service.LoanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/loans")
@RequiredArgsConstructor
public class LoanController {

    private final LoanService service;

    @GetMapping
    public List<Loan> findAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public Loan findById(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Loan create(@RequestBody LoanRequest request) {
        return service.createLoan(request);
    }

    @PutMapping("/{id}/return")
    public Loan returnLoan(@PathVariable Long id) {
        return service.returnLoan(id);
    }
}
