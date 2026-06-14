package com.biblioteca.digital.service;

import com.biblioteca.digital.dto.LoanRequest;
import com.biblioteca.digital.entity.*;
import com.biblioteca.digital.exception.*;
import com.biblioteca.digital.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LoanService {

    private final LoanRepository loanRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;

    public List<Loan> findAll() {
        return loanRepository.findAll();
    }

    public Loan findById(Long id) {
        return loanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Empréstimo não encontrado: " + id));
    }

    public Loan createLoan(LoanRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));
        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new ResourceNotFoundException("Livro não encontrado"));

        if (book.getQuantity() == null || book.getQuantity() <= 0) {
            throw new BusinessException("Livro indisponível");
        }

        book.setQuantity(book.getQuantity() - 1);
        bookRepository.save(book);

        Loan loan = new Loan();
        loan.setUser(user);
        loan.setBook(book);
        loan.setLoanDate(LocalDate.now());
        loan.setDueDate(request.getDueDate() != null ? request.getDueDate() : LocalDate.now().plusDays(14));
        loan.setReturned(false);

        return loanRepository.save(loan);
    }

    public Loan returnLoan(Long loanId) {
        Loan loan = findById(loanId);
        if (loan.isReturned()) {
            throw new BusinessException("Empréstimo já devolvido");
        }
        loan.setReturned(true);
        loan.setReturnDate(LocalDate.now());

        Book book = loan.getBook();
        book.setQuantity(book.getQuantity() + 1);
        bookRepository.save(book);

        return loanRepository.save(loan);
    }
}
