using System.Reflection;
using WorkflowEngine.Abstraction.Mappers;

namespace WorkflowEngine.BusinessLogic.Mappers;

public abstract class BaseMapper<TDto, TEntity> : IMapper<TDto, TEntity>
{
    /// <summary>
    /// Gets the list of property names to ignore during apply/mapping operations.
    /// Override in derived classes to exclude specific properties.
    /// </summary>
    protected virtual List<string> IgnoredFields { get; } = [];

    /// <summary>
    /// Converts the specified entity to its corresponding data transfer object (DTO) representation.
    /// </summary>
    /// <param name="entity">The entity instance to convert. Cannot be null.</param>
    /// <returns>A DTO that represents the provided entity.</returns>
    public abstract TDto MapToDto(TEntity entity);

    /// <summary>
    /// Converts the specified data transfer object (DTO) to its corresponding entity type.
    /// </summary>
    /// <param name="dto">The data transfer object to convert. Cannot be null.</param>
    /// <returns>An instance of the entity type that represents the data contained in the specified DTO.</returns>
    public abstract TEntity MapToEntity(TDto dto);

    /// <summary>
    /// Maps a collection of entities to their corresponding data transfer objects (DTOs).
    /// </summary>
    /// <param name="entities">The collection of entities to map to DTOs. Cannot be null.</param>
    /// <returns>An enumerable collection of DTOs mapped from the input entities. The collection will be empty if no entities are
    /// provided.</returns>
    public IEnumerable<TDto> MapToDtos(IEnumerable<TEntity> entities)
        => entities.Select(MapToDto);

    /// <summary>
    /// Maps a collection of data transfer objects (DTOs) to their corresponding entity objects.
    /// </summary>
    /// <param name="dtos">The collection of DTOs to be mapped to entities. Cannot be null.</param>
    /// <returns>An enumerable collection of entities mapped from the provided DTOs. The collection will be empty if no DTOs are
    /// provided.</returns>
    public IEnumerable<TEntity> MapToEntities(IEnumerable<TDto> dtos)
        => dtos.Select(MapToEntity);

    /// <summary>
    /// Applies the values from the specified data transfer object to the corresponding entity instance.
    /// </summary>
    /// <remarks>This method updates the entity with values from the data transfer object, typically as part
    /// of a mapping or update operation. Only the properties that have been modified in the data transfer object are
    /// applied to the entity.</remarks>
    /// <param name="dto">The data transfer object containing the updated values to apply. Cannot be null.</param>
    /// <param name="entity">The entity instance to which the values from the data transfer object will be applied. Cannot be null.</param>
    public virtual void ApplyToEntity(TDto dto, TEntity entity)
        => ApplyModifiedProperties(dto, entity, IgnoredFields);

    /// <summary>
    /// Applies the values from the specified data transfer object to the corresponding entity instance,
    /// skipping properties whose names are in the provided ignored fields list combined with the mapper's own ignored fields.
    /// </summary>
    /// <param name="dto">The data transfer object containing the updated values to apply. Cannot be null.</param>
    /// <param name="entity">The entity instance to which the values from the data transfer object will be applied. Cannot be null.</param>
    /// <param name="ignoredFields">Additional property names to skip during the apply operation.</param>
    public virtual void ApplyToEntity(TDto dto, TEntity entity, List<string> ignoredFields)
        => ApplyModifiedProperties(dto, entity, [.. IgnoredFields, .. ignoredFields]);

    /// <summary>
    /// Applies the modified properties from the specified entity to the corresponding data transfer object (DTO).
    /// </summary>
    /// <remarks>Use this method to synchronize changes from the entity to its DTO representation, typically
    /// before sending data to a client or external system. Only properties that have been modified in the entity are
    /// applied to the DTO.</remarks>
    /// <param name="entity">The entity instance containing the updated property values to apply.</param>
    /// <param name="dto">The data transfer object to which the modified properties from the entity will be applied.</param>
    public virtual void ApplyToDto(TEntity entity, TDto dto)
        => ApplyModifiedProperties(entity, dto, IgnoredFields);

    /// <summary>
    /// Copies non-null public property values from the source object to matching writable properties on the target
    /// object.
    /// </summary>
    /// <remarks>Only properties with matching names and compatible types are copied. Properties with null
    /// values in the source are ignored. Both source and target must be non-null and have accessible public instance
    /// properties.</remarks>
    /// <typeparam name="TSource">The type of the source object from which property values are read.</typeparam>
    /// <typeparam name="TTarget">The type of the target object to which property values are written.</typeparam>
    /// <param name="source">The object whose readable public properties provide the values to copy. Cannot be null.</param>
    /// <param name="target">The object whose writable public properties are set to the values from the source. Cannot be null.</param>
    private static void ApplyModifiedProperties<TSource, TTarget>(TSource source, TTarget target, List<string> ignoredFields)
    {
        var sourceProperties = typeof(TSource).GetProperties(BindingFlags.Public | BindingFlags.Instance)
            .Where(p => p.CanRead);

        var targetProperties = typeof(TTarget).GetProperties(BindingFlags.Public | BindingFlags.Instance)
            .Where(p => p.CanWrite)
            .ToDictionary(p => p.Name);

        foreach (var sourceProp in sourceProperties)
        {
            if (ignoredFields.Contains(sourceProp.Name))
                continue;

            if (!targetProperties.TryGetValue(sourceProp.Name, out var targetProp))
                continue;

            var value = sourceProp.GetValue(source);

            if (value is null)
                continue;

            if (targetProp.PropertyType.IsAssignableFrom(sourceProp.PropertyType))
                targetProp.SetValue(target, value);
        }
    }
}
