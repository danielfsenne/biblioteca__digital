package com.biblioteca.digital.service;

import com.biblioteca.digital.entity.Book;
import com.biblioteca.digital.exception.ResourceNotFoundException;
import com.biblioteca.digital.repository.BookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BookService {

    private final BookRepository repository;

    public Page<Book> findAll(Pageable pageable) {
        return repository.findAll(pageable);
    }

    public Book findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Livro não encontrado: " + id));
    }

    public List<Book> search(String title) {
        return repository.findByTitleContainingIgnoreCase(title);
    }

    public Book save(Book book) {
        return repository.save(book);
    }

    public Book update(Long id, Book updated) {
        Book existing = findById(id);
        existing.setTitle(updated.getTitle());
        existing.setAuthor(updated.getAuthor());
        existing.setIsbn(updated.getIsbn());
        existing.setQuantity(updated.getQuantity());
        existing.setCategory(updated.getCategory());
        return repository.save(existing);
    }

    public void delete(Long id) {
        findById(id);
        repository.deleteById(id);
    }
}
