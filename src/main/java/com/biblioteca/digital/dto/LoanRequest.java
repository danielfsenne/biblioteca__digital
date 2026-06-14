package com.biblioteca.digital.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class LoanRequest {
    private Long userId;
    private Long bookId;
    private LocalDate dueDate;
}
