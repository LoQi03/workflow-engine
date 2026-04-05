namespace WorkflowEngine.Abstraction.Entities
{
    /// <summary>
    /// Defines properties for tracking the creation, modification, and deletion history of an entity.
    /// </summary>
    /// <remarks>Implement this interface to provide standardized audit information for entities, including
    /// timestamps and user identifiers for create, modify, and delete operations. This can be useful for auditing,
    /// change tracking, and soft-delete scenarios.</remarks>
    public interface IRecordHistory
    {
        /// <summary>
        /// Gets or sets the date and time when the entity was created.
        /// </summary>
        DateTime CreatedAt { get; set; }

        /// <summary>
        /// Gets or sets the identifier of the user who created the entity.
        /// </summary>
        int CreatedUserId { get; set; }

        /// <summary>
        /// Gets or sets the date and time when the entity was last modified.
        /// </summary>
        DateTime? ModifiedAt { get; set; }

        /// <summary>
        /// Gets or sets the identifier of the user who last modified the entity.
        /// </summary>
        int? ModifiedUserId { get; set; }

        /// <summary>
        /// Gets or sets the date and time when the entity was deleted.
        /// </summary>
        /// <remarks>A value of <see langword="null"/> indicates that the entity has not been
        /// deleted.</remarks>
        DateTime? DeletedAt { get; set; }

        /// <summary>
        /// Gets or sets the identifier of the user who deleted the entity, if applicable.
        /// </summary>
        /// <remarks>This property is typically set when an entity is deleted to record which user
        /// performed the deletion. If the entity has not been deleted, the value is null.</remarks>
        int? DeletedUserId { get; set; }

    }
}
