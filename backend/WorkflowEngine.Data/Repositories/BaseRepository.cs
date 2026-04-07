using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using WorkflowEngine.Abstraction.Entities;
using WorkflowEngine.Abstraction.Mappers;
using WorkflowEngine.Abstraction.Repositories;

namespace WorkflowEngine.Data.Repositories;

/// <summary>
/// Provides a generic base implementation for repository operations on entities using a specified data context and
/// mapping strategy.
/// </summary>
/// <remarks>This class supplies common CRUD operations for entities and their corresponding DTOs. It is intended
/// to be inherited by specific repository implementations. The repository uses asynchronous methods for data access and
/// mapping, and is designed to work with Entity Framework Core. Thread safety is not guaranteed; instances should not
/// be shared across threads without proper synchronization.</remarks>
/// <typeparam name="TEntity">The type of the entity managed by the repository. Must implement the IBaseEntity interface.</typeparam>
/// <typeparam name="TDto">The type of the data transfer object (DTO) used to represent the entity in external operations.</typeparam>
/// <param name="context">The database context used to access and manage entity data.</param>
/// <param name="mapper">The mapper responsible for converting between DTOs and entities.</param>
public class BaseRepository<TEntity, TDto>(
    DbContext context,
    IMapper<TDto, TEntity> mapper) : IBaseRepository<TDto>
    where TEntity : class, IBaseEntity
    where TDto : class
{
    /// <summary>
    /// Provides access to the database context used for data operations.
    /// </summary>
    /// <remarks>Intended for use by derived classes to interact with the underlying data store. The context
    /// should be properly disposed of according to the application's lifetime management strategy.</remarks>
    protected readonly DbContext _context = context;

    /// <summary>
    /// Provides access to the mapper used to convert between data transfer objects and entities.
    /// </summary>
    /// <remarks>Intended for use by derived classes to perform mapping operations between TDto and TEntity
    /// types. The mapper instance is initialized through dependency injection or constructor assignment.</remarks>
    protected readonly IMapper<TDto, TEntity> _mapper = mapper;

    /// <summary>
    /// Represents the set of entities of type TEntity in the underlying database context.
    /// </summary>
    /// <remarks>This property provides access to query and manipulate entities of type TEntity within the
    /// database context. It is typically used by repository implementations to perform CRUD operations. Access is
    /// deferred until first use to allow the tenant context to be configured before EF Core initialization.</remarks>
    protected DbSet<TEntity> _dbSet => context.Set<TEntity>();

    /// <summary>
    /// Gets the list of property names to ignore during update operations.
    /// Override in derived classes to exclude specific properties.
    /// </summary>
    protected virtual List<string> IgnoredFields { get; } = [];

    /// <summary>
    /// Asynchronously retrieves all entities from the data source and maps them to their corresponding data transfer
    /// objects.
    /// </summary>
    /// <returns>A task that represents the asynchronous operation. The task result contains an enumerable collection of data
    /// transfer objects representing all entities in the data source. The collection is empty if no entities are found.</returns>
    public virtual async Task<IEnumerable<TDto>> GetAllAsync()
    {
        var entities = await _dbSet.AsNoTracking().ToListAsync();
        return _mapper.MapToDtos(entities);
    }

    /// <summary>
    /// Asynchronously retrieves a data transfer object (DTO) by its unique identifier.
    /// </summary>
    /// <param name="id">The unique identifier of the entity to retrieve.</param>
    /// <returns>A task that represents the asynchronous operation. The task result contains the DTO corresponding to the
    /// specified identifier, or null if no matching entity is found.</returns>
    public virtual async Task<TDto?> GetByIdAsync(int id)
    {
        var entity = await _dbSet.AsNoTracking().FirstOrDefaultAsync(e => e.Id == id);
        return entity is null ? null : _mapper.MapToDto(entity);
    }

    /// <summary>
    /// Asynchronously retrieves all entities that match the specified predicate and maps them to their corresponding DTOs.
    /// </summary>
    /// <param name="predicate">An expression applied to DTOs to filter the results. The expression is translated
    /// to an entity-level predicate so that filtering is performed at the database level.</param>
    /// <returns>A task that represents the asynchronous operation. The task result contains an enumerable collection of DTOs
    /// that satisfy the predicate. The collection is empty if no matching entities are found.</returns>
    public virtual async Task<IEnumerable<TDto>> QueryAsync(Expression<Func<TDto, bool>> predicate)
    {
        var entityPredicate = ExpressionMapper<TDto, TEntity>.MapExpression(predicate);
        var entities = await _dbSet.AsNoTracking().Where(entityPredicate).ToListAsync();
        return _mapper.MapToDtos(entities);
    }

    /// <summary>
    /// Asynchronously creates a new entity in the data store based on the specified data transfer object (DTO).
    /// </summary>
    /// <param name="dto">The data transfer object containing the values to initialize the new entity. Cannot be null.</param>
    /// <returns>A task that represents the asynchronous operation. The task result contains a DTO representing the newly created
    /// entity, including any values generated by the data store.</returns>
    public async Task<TDto> CreateAsync(TDto dto)
    {
        var entity = _mapper.MapToEntity(dto);
        _dbSet.Add(entity);
        await _context.SaveChangesAsync();
        return _mapper.MapToDto(entity);
    }

    /// <summary>
    /// Asynchronously updates an existing entity with the specified identifier using the provided data transfer object.
    /// </summary>
    /// <param name="id">The unique identifier of the entity to update.</param>
    /// <param name="dto">The data transfer object containing the updated values to apply to the entity.</param>
    /// <returns>A task that represents the asynchronous operation. The task result contains the updated data transfer object if
    /// the entity is found and updated; otherwise, <see langword="null"/>.</returns>
    public async Task<TDto?> UpdateAsync(int id, TDto dto)
    {
        var entity = await _dbSet.FindAsync(id);
        if (entity is null)
            return null;

        _mapper.ApplyToEntity(dto, entity, IgnoredFields);
        await _context.SaveChangesAsync();
        return _mapper.MapToDto(entity);
    }

    /// <summary>
    /// Asynchronously deletes the entity with the specified identifier from the data store.
    /// </summary>
    /// <param name="id">The unique identifier of the entity to delete.</param>
    /// <returns>A task that represents the asynchronous operation. The task result is <see langword="true"/> if the entity was
    /// found and deleted; otherwise, <see langword="false"/>.</returns>
    public async Task<bool> DeleteAsync(int id)
    {
        var entity = await _dbSet.FindAsync(id);
        if (entity is null)
            return false;

        _dbSet.Remove(entity);
        await _context.SaveChangesAsync();
        return true;
    }
}
