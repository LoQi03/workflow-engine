namespace WorkflowEngine.Abstraction.Services;

public interface IBaseService<TDto> where TDto : class
{
    Task<IEnumerable<TDto>> GetAllAsync();
    Task<TDto?> GetByIdAsync(int id);
    Task<TDto> CreateAsync(TDto dto);
    Task<TDto?> UpdateAsync(int id, TDto dto);
    Task<bool> DeleteAsync(int id);
}
