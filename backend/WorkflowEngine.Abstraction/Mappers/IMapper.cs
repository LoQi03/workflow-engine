namespace WorkflowEngine.Abstraction.Mappers;

/// <summary>
/// Defines a contract for mapping between data transfer objects (DTOs) and entity types, supporting conversion and
/// property application in both directions.
/// </summary>
/// <remarks>Implement this interface to provide custom mapping logic between DTOs and entities, enabling
/// consistent transformation and update operations across application layers. Typical use cases include data
/// persistence, API communication, and separation of domain and transport models.</remarks>
/// <typeparam name="TDto">The type representing the data transfer object to map to and from.</typeparam>
/// <typeparam name="TEntity">The type representing the entity to map to and from.</typeparam>
public interface IMapper<TDto, TEntity>
{
    /// <summary>
    /// Maps the specified entity to its corresponding data transfer object (DTO) representation.
    /// </summary>
    /// <param name="entity">The entity instance to map to a DTO. Cannot be null.</param>
    /// <returns>A DTO that represents the provided entity.</returns>
    TDto MapToDto(TEntity entity);

    /// <summary>
    /// Converts the specified data transfer object (DTO) to its corresponding entity type.
    /// </summary>
    /// <param name="dto">The data transfer object to convert. Cannot be null.</param>
    /// <returns>An instance of the entity type that represents the data from the specified DTO.</returns>
    TEntity MapToEntity(TDto dto);

    /// <summary>
    /// Maps a collection of entities to their corresponding data transfer objects (DTOs).
    /// </summary>
    /// <param name="entities">The collection of entities to map to DTOs. Cannot be null.</param>
    /// <returns>An enumerable collection of DTOs that represent the mapped entities. The collection will be empty if no entities
    /// are provided.</returns>
    IEnumerable<TDto> MapToDtos(IEnumerable<TEntity> entities);

    /// <summary>
    /// Maps a collection of data transfer objects (DTOs) to their corresponding entity objects.
    /// </summary>
    /// <param name="dtos">The collection of DTOs to be mapped to entities. Cannot be null.</param>
    /// <returns>An enumerable collection of entities mapped from the provided DTOs. The collection will be empty if no DTOs are
    /// provided.</returns>
    IEnumerable<TEntity> MapToEntities(IEnumerable<TDto> dtos);

    /// <summary>
    /// Applies the values from the specified data transfer object to the given entity instance.
    /// </summary>
    /// <remarks>Use this method to update an entity's properties with values from a corresponding DTO,
    /// typically during mapping or update operations. Both parameters must be non-null; otherwise, an exception may be
    /// thrown by the implementation.</remarks>
    /// <param name="dto">The data transfer object containing the values to apply. Cannot be null.</param>
    /// <param name="entity">The entity instance to which the values from the data transfer object will be applied. Cannot be null.</param>
    void ApplyToEntity(TDto dto, TEntity entity);

    /// <summary>
    /// Applies the values from the specified data transfer object to the given entity instance,
    /// skipping properties whose names are in the ignored fields list.
    /// </summary>
    /// <param name="dto">The data transfer object containing the values to apply. Cannot be null.</param>
    /// <param name="entity">The entity instance to which the values from the data transfer object will be applied. Cannot be null.</param>
    /// <param name="ignoredFields">Property names to skip during the apply operation.</param>
    void ApplyToEntity(TDto dto, TEntity entity, List<string> ignoredFields);

    /// <summary>
    /// Applies the values from the specified entity to the provided data transfer object (DTO).
    /// </summary>
    /// <param name="entity">The source entity whose values will be copied to the DTO. Cannot be null.</param>
    /// <param name="dto">The target data transfer object to which values from the entity will be applied. Cannot be null.</param>
    void ApplyToDto(TEntity entity, TDto dto);
}
