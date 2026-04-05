namespace WorkflowEngine.Abstraction.Entities;

/// <summary>
/// Defines a base contract for entities that have a unique integer identifier.
/// </summary>
/// <remarks>Implement this interface to provide a consistent way to identify entities across the application. The
/// identifier is typically used for persistence and entity tracking.</remarks>
public interface IBaseEntity
{
    int Id { get; set; }
}
