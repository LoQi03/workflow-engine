using WorkflowEngine.Abstraction.Repositories;
using WorkflowEngine.Abstraction.Services;

namespace WorkflowEngine.BusinessLogic.Services;

/// <summary>
/// Provides a base implementation for service classes that perform CRUD operations on data transfer objects (DTOs)
/// using a repository pattern.
/// </summary>
/// <remarks>This class is intended to be inherited by concrete service classes that require standard create,
/// read, update, and delete operations. It delegates data access to the provided repository and can be extended to add
/// custom business logic.</remarks>
/// <typeparam name="TDto">The type of data transfer object managed by the service. Must be a reference type.</typeparam>
/// <param name="repository">The repository instance used to perform data access operations for the specified DTO type.</param>
public class BaseService<TDto>(IBaseRepository<TDto> repository) : IBaseService<TDto>
    where TDto : class
{
    /// <summary>
    /// Provides access to the underlying repository for performing data operations on DTO entities.
    /// </summary>
    /// <remarks>This field is intended for use by derived classes to interact with the data store through the
    /// repository abstraction. The repository instance is initialized via dependency injection and should not be
    /// modified after construction.</remarks>
    protected readonly IBaseRepository<TDto> _repository = repository;

    /// <summary>
    /// Asynchronously retrieves all entities as data transfer objects (DTOs).
    /// </summary>
    /// <returns>A task that represents the asynchronous operation. The task result contains an enumerable collection of DTOs for
    /// all entities. The collection is empty if no entities are found.</returns>
    public virtual async Task<IEnumerable<TDto>> GetAllAsync()
        => await _repository.GetAllAsync();

    /// <summary>
    /// Asynchronously retrieves an entity by its unique identifier.
    /// </summary>
    /// <param name="id">The unique identifier of the entity to retrieve.</param>
    /// <returns>A task that represents the asynchronous operation. The task result contains the entity as a data transfer object
    /// if found; otherwise, null.</returns>
    public virtual async Task<TDto?> GetByIdAsync(int id)
        => await _repository.GetByIdAsync(id);

    /// <summary>
    /// Asynchronously creates a new entity in the data store using the specified data transfer object.
    /// </summary>
    /// <param name="dto">The data transfer object containing the values to use when creating the new entity. Cannot be null.</param>
    /// <returns>A task that represents the asynchronous operation. The task result contains the created entity as a data
    /// transfer object.</returns>
    public virtual async Task<TDto> CreateAsync(TDto dto)
        => await _repository.CreateAsync(dto);

    /// <summary>
    /// Updates an existing entity identified by the specified ID with the provided data transfer object asynchronously.
    /// </summary>
    /// <param name="id">The unique identifier of the entity to update.</param>
    /// <param name="dto">The data transfer object containing the updated values for the entity. Cannot be null.</param>
    /// <returns>A task that represents the asynchronous operation. The task result contains the updated data transfer object if
    /// the update is successful; otherwise, null if the entity is not found.</returns>
    public virtual async Task<TDto?> UpdateAsync(int id, TDto dto)
        => await _repository.UpdateAsync(id, dto);

    /// <summary>
    /// Asynchronously deletes the entity with the specified identifier.
    /// </summary>
    /// <param name="id">The unique identifier of the entity to delete.</param>
    /// <returns>A task that represents the asynchronous operation. The task result is <see langword="true"/> if the entity was
    /// successfully deleted; otherwise, <see langword="false"/>.</returns>
    public virtual async Task<bool> DeleteAsync(int id)
        => await _repository.DeleteAsync(id);
}
